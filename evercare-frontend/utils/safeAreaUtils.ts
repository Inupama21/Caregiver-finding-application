import { useSafeAreaInsets } from 'react-native-safe-area-context';


export const useSafeAreaHeader = () => {
  const insets = useSafeAreaInsets();
  
  return {
    insets,
    headerPadding: { paddingTop: insets.top + 10 },
  };
};


export const safeAreaHeaderStyles = {
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1E3A8A',
  },
};
