import { Pressable, Text } from 'react-native';

type Props = { label: string; onPress?: () => void };
export function SecondaryButton({ label, onPress }: Props) { return <Pressable onPress={onPress}><Text>{label}</Text></Pressable>; }
