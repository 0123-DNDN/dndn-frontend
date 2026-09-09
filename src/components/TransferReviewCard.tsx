import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/typography";
import { getApiErrorMessage } from "@/services/auth";
import {
  cancelTransfer,
  completeTransfer,
  confirmTransferDelay,
  finalConfirmTransfer,
  guardianApproveTransfer,
  guardianRejectTransfer,
  type TransferResponse,
} from "@/services/transfer";

export default function TransferReviewCard({
  transfer,
  guardian = false,
  refresh,
}: {
  transfer: TransferResponse;
  guardian?: boolean;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const labels = {
    LOW: "정상",
    CAUTION: "경고",
    HIGH: "위험",
    CRITICAL: "고위험",
  };
  const ready =
    transfer.finalConfirmationAvailable ||
    transfer.status === "FINAL_CONFIRMED";
  const waiting = transfer.status === "WAITING_GUARDIAN";
  const cancelled = ["CANCELLED", "GUARDIAN_REJECTED"].includes(
    transfer.status,
  );
  const finished = cancelled || transfer.status === "COMPLETED";
  const message = finished
    ? cancelled
      ? "취소된 송금이에요."
      : "송금이 완료됐어요."
    : transfer.blocked
      ? "차단된 거래로 송금하거나 승인할 수 없어요."
      : transfer.status === "DELAY_CONFIRM"
        ? "내용을 확인하면 5시간 대기를 시작해요. 자동으로 송금되지는 않아요."
        : transfer.status === "GUARDIAN_APPROVED"
          ? "보호자가 승인했어요. 본인이 최종 확인하면 송금할 수 있어요."
          : ready
            ? "대기 시간이 지났어요. 내용을 다시 확인하고 송금해 주세요."
            : transfer.availableAt
              ? `${new Date(transfer.availableAt).toLocaleString("ko-KR")}부터 다시 확인하고 보낼 수 있어요. 보호자가 승인하면 더 일찍 보낼 수 있어요.`
              : "보호자 승인이 필요해요. 시간이 지나도 자동으로 해제되지 않아요.";

  const run = async (action: "send" | "delay" | "approve" | "cancel") => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const id = transfer.transactionId;
      if (action === "delay") await confirmTransferDelay(id);
      if (action === "approve") await guardianApproveTransfer(id);
      if (action === "cancel")
        await (guardian ? guardianRejectTransfer(id) : cancelTransfer(id));
      if (action === "send") {
        if (transfer.status !== "FINAL_CONFIRMED")
          await finalConfirmTransfer(id);
        await completeTransfer(id);
      }
      setRejectModalVisible(false);
      await refresh();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "처리하지 못했어요. 다시 확인해 주세요."),
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  const confirm = (action: "send" | "approve" | "cancel") =>
    Alert.alert(
      action === "send"
        ? "이대로 송금할까요?"
        : action === "approve"
          ? "이 거래를 승인할까요?"
          : "송금을 취소할까요?",
      `${transfer.receiverName} · ${transfer.receiverBankCode}\n${transfer.receiverAccountNumber}\n${transfer.amount.toLocaleString()}원` +
        (action === "approve"
          ? "\n승인 후에도 시니어가 최종 확인해야 송금돼요."
          : ""),
      [
        { text: "돌아가기", style: "cancel" },
        { text: "확인", onPress: () => void run(action) },
      ],
    );
  return (
    <View style={styles.card}>
      <Text style={styles.badge}>
        {transfer.riskLevel ? labels[transfer.riskLevel] : "송금 확인"}
        {transfer.riskScore != null ? ` · ${transfer.riskScore}점` : ""}
      </Text>
      <Text style={styles.title}>
        {transfer.receiverName}님에게 {transfer.amount.toLocaleString()}원
      </Text>
      <Text style={styles.body}>
        {transfer.receiverBankCode} · {transfer.receiverAccountNumber}
      </Text>
      <Text style={styles.body}>송금 이유: {transfer.purpose}</Text>
      {guardian && transfer.senderPhone && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {
            const phone = transfer.senderPhone?.replace(/[^0-9+]/g, "");
            if (phone)
              void Linking.openURL(`tel:${phone}`).catch(() =>
                setError("전화 앱을 열지 못했어요."),
              );
          }}
        >
          <Text style={styles.callButtonText}>
            {transfer.senderName ?? "시니어"}님에게 전화하기
          </Text>
        </TouchableOpacity>
      )}
      {guardian &&
        (transfer.riskReasons ?? []).map((reason, index) => (
          <Text key={index} style={styles.body}>
            • {reason}
          </Text>
        ))}
      <Text style={styles.notice}>{message}</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!finished && !guardian && transfer.status === "DELAY_CONFIRM" && (
        <TouchableOpacity
          disabled={busy}
          style={styles.button}
          onPress={() => void run("delay")}
        >
          <Text style={styles.buttonText}>확인하고 5시간 대기</Text>
        </TouchableOpacity>
      )}
      {!finished && !transfer.blocked && (guardian ? waiting : ready) && (
        <TouchableOpacity
          disabled={busy}
          style={styles.button}
          onPress={() => confirm(guardian ? "approve" : "send")}
        >
          <Text style={styles.buttonText}>
            {busy
              ? "처리 중…"
              : guardian
                ? "확인 후 승인"
                : "최종 확인 후 송금"}
          </Text>
        </TouchableOpacity>
      )}
      {!finished && (!guardian || waiting) && (
        <TouchableOpacity
          disabled={busy}
          style={styles.cancel}
          onPress={() =>
            guardian ? setRejectModalVisible(true) : confirm("cancel")
          }
        >
          <Text style={styles.body}>
            {guardian ? "거절하고 송금 취소" : "송금 취소"}
          </Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !busy && setRejectModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !busy && setRejectModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>송금 거절</Text>
            </View>
            <Text style={styles.modalTitle}>이 송금을 거절할까요?</Text>
            <Text style={styles.modalDescription}>
              거절하면 {transfer.senderName ?? "시니어"}님의 송금이 취소돼요.
            </Text>
            <View style={styles.modalTransferInfo}>
              <Text style={styles.modalRecipient}>
                {transfer.receiverName}님
              </Text>
              <Text style={styles.modalAmount}>
                {transfer.amount.toLocaleString()}원
              </Text>
              <Text style={styles.modalAccount}>
                {transfer.receiverBankCode} · {transfer.receiverAccountNumber}
              </Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                disabled={busy}
                style={styles.modalBackButton}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalBackText}>돌아가기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={busy}
                style={styles.modalRejectButton}
                onPress={() => void run("cancel")}
              >
                <Text style={styles.modalRejectText}>
                  {busy ? "처리 중…" : "거절하기"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    gap: 12,
    marginBottom: 16,
  },
  badge: { fontFamily: fonts.bold, fontSize: 16, color: "#A34418" },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 32,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
  },
  notice: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 28,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontFamily: fonts.bold, fontSize: 18 },
  callButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#E8F4EF",
  },
  callButtonText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
  },
  cancel: { padding: 12, alignItems: "center" },
  error: { color: "#C43D3D", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(25, 31, 40, 0.48)",
  },
  modalCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  modalBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
  },
  modalBadgeText: { fontFamily: fonts.bold, fontSize: 15, color: "#C43D3D" },
  modalTitle: {
    marginTop: 16,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 34,
    color: colors.text,
  },
  modalDescription: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7684",
  },
  modalTransferInfo: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
  },
  modalRecipient: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  modalAmount: {
    marginTop: 6,
    fontFamily: fonts.bold,
    fontSize: 25,
    color: colors.text,
  },
  modalAccount: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: "#6B7684",
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 22 },
  modalBackButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F2F4F6",
  },
  modalBackText: { fontFamily: fonts.bold, fontSize: 17, color: "#4E5968" },
  modalRejectButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#F04452",
  },
  modalRejectText: { fontFamily: fonts.bold, fontSize: 17, color: "#FFFFFF" },
});
