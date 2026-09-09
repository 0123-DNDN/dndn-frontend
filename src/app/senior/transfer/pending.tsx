import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransferReviewCard from "@/components/TransferReviewCard";
import {
  getPendingTransfers,
  type TransferResponse,
} from "@/services/transfer";
import { getApiErrorMessage } from "@/services/auth";

export default function PendingTransfers() {
  const [items, setItems] = useState<TransferResponse[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      setItems(await getPendingTransfers());
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "보류 중인 송금을 불러오지 못했어요."));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void refresh();
      const timer = setInterval(() => void refresh(), 15000);
      return () => clearInterval(timer);
    }, [refresh]),
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 20 }}>
          보류 중인 송금
        </Text>
        {!!error && (
          <Text style={{ color: "#C43D3D", marginBottom: 16 }}>{error}</Text>
        )}
        <TouchableOpacity onPress={() => void refresh()}>
          <Text style={{ fontSize: 17, marginBottom: 20 }}>새로고침</Text>
        </TouchableOpacity>
        {loading ? (
          <Text>불러오는 중…</Text>
        ) : (
          !error && !items.length && <Text>보류 중인 송금이 없어요.</Text>
        )}
        {items.map((item) => (
          <TransferReviewCard
            key={item.transactionId}
            transfer={item}
            refresh={refresh}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
