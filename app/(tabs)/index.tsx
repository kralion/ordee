import { ITable } from "@/interfaces";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  ActivityIndicator,
  Chip,
  Divider,
  IconButton,
  Text,
  Button,
} from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrderContext } from "@/context";
import { toast } from "sonner-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

function TableSvg({ table, index }: { table: ITable; index: number }) {
  const rotation = useSharedValue(90);
  useEffect(() => {
    rotation.value = withDelay(
      index * 50,
      withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${rotation.value}deg` }],
    };
  });
  const deleteTable = async (id: string) => {
    await supabase.from("tables").delete().eq("id", id);
  };

  function onLongPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Borrar mesa", "¿Estás seguro de borrar esta mesa?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Aceptar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTable(table.id as string);
            toast.success("Mesa borrada!", {
              icon: <FontAwesome name="check-circle" size={20} color="green" />,
            });
          } catch (error: any) {
            alert("Error al eliminar: " + error.message);
          }
        },
      },
    ]);
  }

  function onPress() {
    if (table.status) {
      router.push({
        pathname: "/add-order",
        params: { number: table.number, id_table: table.id },
      });
    } else {
      Alert.alert(
        "Mesa Ocupada",
        "No se pueden agregar pedidos a esta mesa",
        [
          {
            text: "Aceptar",
            onPress: () => {},
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    }
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
        <View className="flex flex-col items-center justify-center">
          {table.status ? (
            <Text className="text-2xl font-bold dark:text-white">
              {table.number}
            </Text>
          ) : (
            <Chip
              mode="flat"
              style={{ backgroundColor: "#ef4444" }}
              selectedColor="#fecaca"
            >
              Ocupado
            </Chip>
          )}
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/128/12924/12924575.png",
            }}
            style={{ width: 100, height: 100 }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TablesScreen() {
  const [tables, setTables] = useState<ITable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const { addTable } = useOrderContext();
  const colorScheme = useColorScheme();
  const tableBottomSheetRef = useRef<BottomSheet>(null);
  const [number, setNumber] = useState<number>(0);
  const snapPoints = useMemo(() => ["40%"], []);
  const isDarkMode = colorScheme === "dark";
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );

  const onSubmitTable = async (e: any) => {
    addTable({
      number,
      status: true,
    });
    tableBottomSheetRef.current?.close();
    setNumber(0);
  };
  const getTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }
      setTables(data || []);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTables();
    supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
        },
        (payload) => {
          getTables();
        }
      )
      .subscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getTables();
      return () => {
        if (channelRef.current) {
          channelRef.current.unsubscribe();
          channelRef.current = null;
        }
      };
    }, [getTables])
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-zinc-900">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="p-4 bg-white dark:bg-zinc-900 h-screen">
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-col gap-2">
          <Text
            className="text-4xl dark:text-white"
            style={{ fontWeight: "700" }}
          >
            Mesas
          </Text>
          <Text className="opacity-50 dark:text-white">
            Listado de mesas del local
          </Text>
        </View>
        <IconButton
          mode="contained"
          icon="plus"
          onPress={() => tableBottomSheetRef.current?.expand()}
        />
      </View>
      <Divider style={{ marginTop: 16 }} />

      <ScrollView contentContainerStyle={{ paddingVertical: 40 }}>
        <View className="flex-row flex-wrap justify-center items-center  gap-8">
          {tables.map((table, index) => (
            <TableSvg key={table.id} table={table} index={index} />
          ))}
          {tables.length === 0 && (
            <SafeAreaView className="flex flex-col gap-4 items-center justify-center mt-20">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/128/17768/17768766.png",
                }}
                style={{ width: 100, height: 100, opacity: 0.5 }}
              />
              <Text style={{ color: "gray" }}>No hay mesas para mostrar</Text>
            </SafeAreaView>
          )}
        </View>
      </ScrollView>
      <BottomSheet
        ref={tableBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: "gray" }}
        backgroundStyle={{
          backgroundColor: isDarkMode ? "#262626" : "white",
        }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView className="p-4 flex flex-col gap-4">
          <View className="flex flex-col gap-2">
            <Text variant="bodyMedium" style={{ color: "gray" }}>
              Número de Mesa
            </Text>
            <BottomSheetTextInput
              className="border rounded-lg border-gray-200 p-4 w-full dark:border-zinc-700 text-black dark:text-white"
              keyboardType="numeric"
              value={String(number)}
              onChangeText={(text) => setNumber(Number(text))}
            />
          </View>

          <Button mode="contained" onPress={onSubmitTable}>
            Registrar Mesa
          </Button>

          <Button
            onPress={() => tableBottomSheetRef.current?.close()}
            mode="outlined"
          >
            Cancelar
          </Button>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
