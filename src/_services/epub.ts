import * as fflate from 'fflate';
import { XMLParser } from 'fast-xml-parser';
import path from 'path-browserify-esm';

export interface EpubMetaValue {
  name: string;
  value: string;
}

export interface EpubMetadata {
  identifier: string;
  title: string;
  meta: EpubMetaValue[];
}

export interface EpubManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

export interface EpubSpineItem {
  item: EpubManifestItem;
  prop?: string;
}

const pathJoin = (...parts: string[]) => path.join(...parts);
const pathDir = (x: string) => path.dirname(x);

export const CreateEpub = (epubFile: Uint8Array) => {
  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getMetadata = (rootFile: any): EpubMetadata => {
    const metadata = rootFile['package']['metadata'];
    return {
      identifier: metadata['dc:identifier']['#text'],
      title: metadata['dc:title'],
      meta: (metadata['meta'] as [])
        .map((x) => {
          const name = x['@name'] ?? x['@property'];
          const content = x['@content'] ?? x['#text'];
          if (name === undefined) return;
          return {
            name: name,
            value: content,
          };
        })
        .filter((x) => x !== undefined),
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getManifests = (rootFile: any): EpubManifestItem[] => {
    const manifest = rootFile['package']['manifest'];
    return (manifest['item'] as []).map((x) => {
      const id = x['@id'];
      const href = x['@href'];
      const mediaType = x['@media-type'];

      return {
        id: id,
        href: href,
        mediaType: mediaType,
      };
    });
  };

  const getSpine = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rootFile: any,
    items: EpubManifestItem[]
  ): EpubSpineItem[] => {
    const spine = rootFile['package']['spine'];
    return (spine['itemref'] as [])
      .map((x) => {
        const idref = x['@idref'];
        const prop = x['@properties'];
        const item = items.find((x) => x.id === idref);
        if (!item) return;

        return {
          item: item,
          prop: prop,
        };
      })
      .filter((x) => x !== undefined);
  };

  const parseEpub = (epubData: fflate.Unzipped) => {
    const containerXml = Buffer.from(
      epubData['META-INF/container.xml']
    ).toString('utf8');

    const container = xmlParser.parse(containerXml);
    const rootfile = container['container']['rootfiles']['rootfile'];
    const rootFilePath = rootfile['@full-path'];
    const rootFile = xmlParser.parse(
      Buffer.from(epubData[rootFilePath]).toString('utf8')
    );
    const metaData = getMetadata(rootFile);
    const manifests = getManifests(rootFile);
    const spine = getSpine(rootFile, manifests);

    return {
      metaData: metaData,
      manifest: manifests,
      spine: spine,
    };
  };

  const epubData = fflate.unzipSync(epubFile);
  const epub = parseEpub(epubData);

  return {
    ...epub,
    epubData,
  };
};

export const CreateEpubController = (epub: Epub) => {
  const { epubData } = epub;
  const getCoverImage = () => {
    const cover = epub.metaData.meta.find((x) => x.name === 'cover');
    if (!cover) return;
    const coverItem = epub.manifest.find((x) => x.id === cover.value);
    if (!coverItem) return;
    return epubData[`EPUB/${coverItem.href}`];
  };

  const getPage = (index: number): Promise<string | undefined> => {
    const domParser = new DOMParser();
    return new Promise((resolve) => {
      if (index < 0 || epub.spine.length <= index) {
        resolve(undefined);
      }

      const pageInfo = epub.spine[index];
      const pagePath = `EPUB/${pageInfo.item.href}`;
      const pageDir = pathDir(pagePath);
      const pageData = epubData[pagePath];

      // CSSとかimgとかをEPUB内のファイルで置き換える
      const pageDom = domParser.parseFromString(
        Buffer.from(pageData).toString('utf8'),
        'text/html'
      );

      // CSSの置き換え
      const head = pageDom.querySelector('head');
      if (head) {
        const cssLinks = Array.from(head.querySelectorAll('link')).filter(
          (link) => {
            const rel = link.rel;
            return rel === 'stylesheet';
          }
        );
        for (const cssLink of cssLinks) {
          head.removeChild(cssLink);

          const cssPath = pathJoin(pageDir, cssLink.getAttribute('href') ?? '');
          const cssData = epubData[cssPath];
          const cssText = Buffer.from(cssData).toString('utf8');
          const style = pageDom.createElement('style');
          style.textContent = cssText;
          head.appendChild(style);
        }
      }

      // Imgの置き換え
      const imgs = Array.from(pageDom.querySelectorAll('img'));
      for (const img of imgs) {
        const imgPath = pathJoin(pageDir, img.getAttribute('src') ?? '');
        const imgData = epubData[imgPath];

        img.src = `data:image/png;base64,${Buffer.from(imgData).toString(
          'base64'
        )}`;
        // // epubの情報が嘘かもしれないので上書きする
        // img.onload = () => {
        //   img.setAttribute('width', img.width.toString());
        //   img.setAttribute('height', img.height.toString());
        // };
      }

      resolve(pageDom.querySelector('html')?.outerHTML);
    });
  };

  const isFixedLayout =
    epub.metaData.meta.find((x) => x.name === 'fixed-layout')?.value === 'true';

  const originalResolution = (() => {
    const reso = epub.metaData.meta.find(
      (x) => x.name === 'original-resolution'
    )?.value;
    if (!reso) return;
    const wh = reso.split('x');

    return {
      width: parseInt(wh[0]),
      height: parseInt(wh[1]),
    };
  })();
  return {
    epub,
    getCoverImage,
    getPage,
    isFixedLayout,
    originalResolution,
  };
};

export type Epub = ReturnType<typeof CreateEpub>;
export type EpubController = ReturnType<typeof CreateEpubController>;
