import React, { createContext, useCallback, useContext, useState } from "react";
import useAppSnackbar from "../hook/useAppSnackBar";

interface NameContextProps {
  name: string;
  getName: ({ a, b }: { a?: number; b?: number }) => Promise<void>;
  getting: boolean;
}

const NameContext = createContext<NameContextProps>({
  //init value
  name: "",
  getName: async () => {},
  getting: false,
});

interface NameContextProviderProps {
  children: React.ReactNode;
}

const NameProvider = ({ children }: NameContextProviderProps) => {
  //state
  const [name, setName] = useState("");
  const [getting, setGetting] = useState(false);

  //
  const { showSnackbarError } = useAppSnackbar();
  //function
  const getName = useCallback(
    async ({ a, b }: { a?: number; b?: number }) => {
      try {
        setGetting(true);
        //get Api
        //setName = ?? (Api)
      } catch (error) {
        showSnackbarError(error);
      } finally {
        setGetting(false);
      }
    },
    [name]
  );
  //useEffect

  return (
    <NameContext.Provider
      value={{
        name,

        getName,
        getting,
      }}
    >
      {children}
    </NameContext.Provider>
  );
};

export const useName = () => {
  const store = useContext(NameContext);
  return store;
};

export default NameProvider;
