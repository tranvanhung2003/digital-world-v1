export { default as ProductGrid } from './components/ProductGrid';
export { default as ProductFilters } from './components/ProductFilters';
export { default as ProductGallery } from './components/ProductGallery';

export {
  addToRecentlyViewed,
  clearRecentlyViewed,
  addToCompareList,
  removeFromCompareList,
  clearCompareList,
  setPriceRange,
  setCategories,
  setAttributes,
  setSortBy,
  clearFilters,
  loadRecentlyViewed,
} from './productsSlice';
export { default as productsReducer } from './productsSlice';
