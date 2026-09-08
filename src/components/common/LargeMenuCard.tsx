import { Pressable, Text } from 'react-native';
type Props = { title: string; description?: string; onPress?: () => void };
export function LargeMenuCard({ title, description, onPress }: Props) { return <Pressable onPress={onPress}><Text>{title}</Text>{description && <Text>{description}</Text>}</Pressable>; }
