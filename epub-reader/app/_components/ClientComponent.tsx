'use client';
import { useEffect, useState } from 'react';
import { CreateEpub, Epub } from '../_services';

const epubFilePath = '/books/618908_001_SPY×FAMILY 1.epub';

export const ClientComponent = () => {
  const [epub, setEpub] = useState<Epub>();
  // const [cover, setCover] = useState<Uint8Array>();
  const [pageHtml, setPageHtml] = useState<string>();
  const [page, setPage] = useState(0);
  // const pageElement = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    (async () => {
      const response = await fetch(epubFilePath);
      const epubFile = await response.arrayBuffer();
      const epub = CreateEpub(new Uint8Array(epubFile));
      setEpub(epub);
      // setCover(epub.getCoverImage());
    })();
  }, [setEpub]);

  useEffect(() => {
    if (!epub) return;
    const html = epub.getPage(page);
    if (!html) return;
    setPageHtml(html.outerHTML);
  }, [epub, page]);

  const aaa = async () => {
    setPage(page + 1);
  };

  return (
    <div>
      <h1>{epub?.metadata.title}</h1>

      <iframe srcDoc={pageHtml} width="100%" height="1600px"></iframe>

      <button onClick={aaa}>call</button>
    </div>
  );
};
