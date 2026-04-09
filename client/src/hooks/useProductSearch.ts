import { useState, useMemo } from "react";

export interface SearchableProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
}

export function useProductSearch(products: SearchableProduct[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const hasResults = filteredProducts.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    hasResults,
    isSearching,
    resultCount: filteredProducts.length,
  };
}
