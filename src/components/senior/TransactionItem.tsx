import { Text, View } from 'react-native';
export function TransactionItem({ title, amount }: { title: string; amount: string }) { return <View><Text>{title}</Text><Text>{amount}</Text></View>; }
