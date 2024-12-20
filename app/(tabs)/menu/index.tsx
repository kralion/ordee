import MealCard from "@/components/meal-card";
import { useMealContext } from "@/context/meals";
import { supabase } from "@/utils/supabase";
import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { ActivityIndicator, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const { meals, getDailyMeals } = useMealContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      await getDailyMeals();
    } catch (error) {
      console.error("Error refreshing meals:", error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [getDailyMeals]);
  React.useEffect(() => {
    getDailyMeals();
    const channel = supabase.channel("meals-changes").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "meals",
      },
      () => {
        getDailyMeals();
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const filteredMeals = React.useMemo(() => {
    if (!search) return meals;
    const lowercasedSearch = search.toLowerCase();
    return meals.filter(
      (meals) =>
        meals.name.toString().includes(lowercasedSearch) ||
        meals.category.toString().includes(lowercasedSearch)
    );
  }, [search, meals]);

  if (!meals) return <ActivityIndicator />;
  if (isLoading && !meals?.length) return <ActivityIndicator />;
  return (
    <View className="flex-1">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className=" bg-white flex-1 h-screen-safe"
      >
        <FlashList
          contentContainerStyle={{}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item: meal }) => <MealCard meal={meal} />}
          data={filteredMeals}
          estimatedItemSize={200}
          horizontal={false}
        />
      </ScrollView>
      <FAB
        icon="toy-brick-plus-outline"
        variant="tertiary"
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => router.push("/menu/add-meal")}
      />
    </View>
  );
}
