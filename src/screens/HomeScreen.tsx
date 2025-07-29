import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { colors, spacing } from "../config/theme";
import { gridLayout, responsiveFontSize } from "../utils/dimensions";
import { Product, Category } from "../types";
import { getDBConnection } from "../database/database";
import { SQLTransaction, SQLResultSet } from "../types/sqlite";

export const HomeScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [cart, setCart] = useState<Array<Product & { quantity: number }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const db = getDBConnection();

    // Carregar categorias
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM categories ORDER BY name",
        [],
        (_: SQLTransaction, resultSet: SQLResultSet) => {
          const { rows } = resultSet;
          const cats: Category[] = [];
          for (let i = 0; i < rows.length; i++) {
            cats.push(rows.item<Category>(i));
          }
          setCategories([{ id: 0, name: "Todos" }, ...cats]);
        }
      );

      // Carregar produtos
      tx.executeSql(
        "SELECT * FROM products WHERE available = 1 ORDER BY name",
        [],
        (_: SQLTransaction, resultSet: SQLResultSet) => {
          const { rows } = resultSet;
          const prods: Product[] = [];
          for (let i = 0; i < rows.length; i++) {
            prods.push({ ...rows.item<Product>(i), available: true });
          }
          setProducts(prods);
        }
      );
    });
  };

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => addToCart(item)}
      activeOpacity={0.8}
    >
      <View style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productDescription} numberOfLines={1}>
        {item.description}
      </Text>
      <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addToCart(item)}
      >
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cantina da Pibe</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>
            Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </Text>
          <Text style={styles.cartTotal}>R$ {getTotalPrice().toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name &&
                  styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name &&
                    styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id?.toString() || ""}
          numColumns={gridLayout.productColumns}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: gridLayout.containerPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  title: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: "bold",
    color: colors.primary,
  },
  cartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  cartButtonText: {
    color: colors.white,
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
  },
  cartTotal: {
    color: colors.white,
    fontSize: responsiveFontSize.small,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    maxHeight: 60,
    paddingHorizontal: gridLayout.containerPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray.light,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: responsiveFontSize.medium,
    color: colors.gray.dark,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  productsContainer: {
    padding: gridLayout.containerPadding,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: gridLayout.itemSpacing,
  },
  productCard: {
    width: gridLayout.productCardWidth,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    backgroundColor: colors.gray.light,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  productName: {
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
    color: colors.black,
    marginBottom: spacing.xs,
  },
  productDescription: {
    fontSize: responsiveFontSize.small,
    color: colors.gray.medium,
    marginBottom: spacing.sm,
  },
  productPrice: {
    fontSize: responsiveFontSize.large,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignItems: "center",
  },
  addButtonText: {
    color: colors.white,
    fontSize: responsiveFontSize.medium,
    fontWeight: "600",
  },
});
