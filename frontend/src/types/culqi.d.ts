// Extender la interfaz Window para incluir Culqi
declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (settings: {
        title: string;
        currency: string;
        description: string;
        amount: number;
        order: string;
      }) => void;
      options: (options: {
        lang: string;
        installments: boolean;
        paymentMethods: {
          tarjeta: boolean;
          yape: boolean;
          bancaMovil: boolean;
          billetera: boolean;
          cuotealo: boolean;
        };
        style: {
          logo: string;
          bannerColor: string;
          buttonBackground: string;
          menuColor: string;
          linksColor: string;
          buttonText: string;
          buttonTextColor: string;
          priceColor: string;
        };
      }) => void;
      open: () => void;
      close: () => void;
    };
  }
}

export {};
