import { createContext, useContext } from 'react';

/**
 * ReactのContext生成ヘルパー
 * @param createFunc Context化するオブジェクトの生成関数
 * @returns ContextとProvider
 */
export const MakeContext = <TArgs, TReturn>(
  createFunc: (_: TArgs) => TReturn
) => {
  // Contextを生成
  const context = createContext<TReturn>({} as TReturn);
  // useヘルパ
  const use = () => {
    const ctx = useContext(context);
    return ctx;
  };

  // Providerを生成
  const provider = ({ children, ...rest }: React.PropsWithChildren<TArgs>) => {
    const client = createFunc({ ...rest } as TArgs);
    return <context.Provider value={client}>{children}</context.Provider>;
  };

  return {
    provider,
    use,
  };
};
