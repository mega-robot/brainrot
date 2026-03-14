import React, { createContext, useContext, useState } from 'react';
import KawaiiAlert from '../components/KawaiiAlert';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = (title, message, buttons) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      onClose: () => setAlertConfig(null),
    });
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {alertConfig && (
        <KawaiiAlert 
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={alertConfig.onClose}
        />
      )}
    </AlertContext.Provider>
  );
};
