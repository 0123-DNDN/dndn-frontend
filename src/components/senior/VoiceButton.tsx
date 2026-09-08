import { Pressable, Text } from 'react-native';
export function VoiceButton({ onPress }: { onPress?: () => void }) { return <Pressable onPress={onPress}><Text>말하기</Text></Pressable>; }
