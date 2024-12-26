import { IOrder } from "@/interfaces";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

export default function PaymentCard({ order }: { order: IOrder }) {
  const formattedDate = new Date(order.date ?? new Date()).toLocaleString(
    "es-ES",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

  return (
    <Card
      style={{
        marginVertical: 8,
        backgroundColor: "white",
        shadowOpacity: 0,
      }}
      onPress={() => {
        router.push(`/(tabs)/payments/receipt/${order.id}`);
      }}
    >
      <Card.Title
        title={"Mesa " + order.id_table}
        subtitleStyle={{ fontSize: 12, color: "gray" }}
        subtitle={formattedDate}
        left={(props) => (
          <FontAwesome6 name="file-invoice-dollar" color="#22c55e" {...props} />
        )}
        right={(props) => (
          <View className="flex flex-row items-center  gap-2 mr-4">
            <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
              S/. {order.total.toFixed(2)}
            </Text>
            <FontAwesome6 name="chevron-right" size={16} color="#a1a1aa" />
          </View>
        )}
      />
    </Card>
  );
}
