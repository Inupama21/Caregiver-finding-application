import React from "react";
import { StripeProvider as StripeProviderRN } from "@stripe/stripe-react-native";

interface StripeProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY as string;

  return (
    <StripeProviderRN publishableKey={publishableKey}>
      {children}
    </StripeProviderRN>
  );
};

export default StripeProvider;
