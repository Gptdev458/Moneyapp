import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the main App.tsx flow instead of showing this screen
  return <Redirect href="../" />;
}
