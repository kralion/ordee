import { supabase } from "@/utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { AppState, Linking, ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
type TLogin = {
  email: string;
  password: string;
};

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function SignInScreen() {
  const [loading, setLoading] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TLogin>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TLogin) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error("Credenciales incorrectas!", {
        icon: <FontAwesome name="times-circle" size={20} color="red" />,
      });
    } else {
      toast.success("Inicio de sesión exitoso!", {
        icon: <FontAwesome name="check-circle" size={20} color="green" />,
      });
      reset();
    }
    setLoading(false);
  };

  return (
    <ScrollView className="bg-white">
      <SafeAreaView className="flex flex-col justify-center align-middle m-4 items-center ">
        <View className="flex flex-col gap-16 w-full items-center">
          <View className="flex flex-col items-center gap-8 mt-20">
            <Image
              style={{
                width: 125,
                height: 125,
              }}
              source={require("../../assets/images/logo.png")}
            />
            <View className="flex flex-col gap-1 items-center">
              <Text className="text-4xl font-bold"> Inicia Sesión</Text>
              <Text className="text-center ">
                Ingresa las credenciales de tu cuenta
              </Text>
            </View>
          </View>
          <View className="flex flex-col gap-6 justify-center align-middle w-full">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Email"
                    mode="outlined"
                    error={errors.email ? true : false}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors.email && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.email.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: { value: true, message: "Ingrese el email" },
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Ingrese un email válido",
                },
              }}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View className="flex flex-col gap-2">
                  <TextInput
                    label="Contraseña"
                    secureTextEntry
                    mode="outlined"
                    error={errors.password ? true : false}
                    onChangeText={onChange}
                    value={value}
                    right={<TextInput.Icon icon="lock" />}
                  />
                  {errors.password && (
                    <View className="flex flex-row gap-1">
                      <Text className="text-red-500">
                        {errors.password.message}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              rules={{
                required: { value: true, message: "Ingrese la contraseña" },
              }}
            />
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            >
              Iniciar Sesión
            </Button>
          </View>
          <View className="mt-20 flex flex-col gap-2">
            <Text className="text-muted-foreground text-zinc-400   mx-auto">
              Desarrollado por
              <Text
                className="font-bold text-orange-500"
                onPress={() => Linking.openURL("https://grobles.netlify.app")}
              >
                {" "}
                Grobles
              </Text>
            </Text>
            <Text className="text-muted-foreground text-zinc-400   mx-auto text-sm">
              Versión 1.2.2
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
