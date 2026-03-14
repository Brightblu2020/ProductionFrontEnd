import { useState, useEffect, useCallback } from 'react'
import { useBom } from '../../hooks/useBom'
import ProductList from './ProductList'
import BomViewer from './BomViewer'

export default function BomDashboard() {
  const {
    products,
    bom,
    explosion,
    versions,
    loading,
    fetchProducts,
    fetchBom,
    fetchExplosion,
    fetchVersions,
    createBom,
    updateBom,
    activateBom,
    setBom,
  } = useBom()

  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleTypeFilter = useCallback(
    (type) => {
      fetchProducts(type)
    },
    [fetchProducts]
  )

  const handleSelectProduct = useCallback(
    (product) => {
      setSelectedProduct(product)
      if (product.activeBomId) {
        fetchBom(product.activeBomId)
      } else {
        setBom(null)
      }
    },
    [fetchBom, setBom]
  )

  const handleSubAssemblyClick = useCallback(
    (sku) => {
      const subProduct = products.find((p) => p.sku === sku)
      if (subProduct) {
        handleSelectProduct(subProduct)
      }
    },
    [products, handleSelectProduct]
  )

  const handleSelectVersion = useCallback(
    (bomId) => {
      fetchBom(bomId)
    },
    [fetchBom]
  )

  const handleCreateBom = useCallback(
    async (productId, lineItems) => {
      const created = await createBom(productId, lineItems)
      fetchBom(created.bomId)
      fetchProducts()
    },
    [createBom, fetchBom, fetchProducts]
  )

  const handleUpdateBom = useCallback(
    async (bomId, lineItems) => {
      await updateBom(bomId, lineItems)
      fetchBom(bomId)
    },
    [updateBom, fetchBom]
  )

  const handleActivateBom = useCallback(
    async (bomId) => {
      await activateBom(bomId)
      fetchBom(bomId)
      fetchProducts()
    },
    [activateBom, fetchBom, fetchProducts]
  )

  return (
    <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.12))]">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">BOM Management</h1>
      <div className="flex h-[calc(100%-2.5rem)] bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Left panel */}
        <div className="w-80 border-r border-slate-200 flex-shrink-0">
          <ProductList
            products={products}
            loading={loading && !selectedProduct}
            selectedSku={selectedProduct?.sku}
            onSelect={handleSelectProduct}
            onTypeFilter={handleTypeFilter}
          />
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <BomViewer
            product={selectedProduct}
            bom={bom}
            explosion={explosion}
            versions={versions}
            loading={loading}
            products={products}
            onSubAssemblyClick={handleSubAssemblyClick}
            onFetchExplosion={fetchExplosion}
            onFetchVersions={fetchVersions}
            onSelectVersion={handleSelectVersion}
            onCreateBom={handleCreateBom}
            onUpdateBom={handleUpdateBom}
            onActivateBom={handleActivateBom}
          />
        </div>
      </div>
    </div>
  )
}
