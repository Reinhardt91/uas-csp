'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Cookies from 'js-cookie'

interface User {
  id: string
  username: string
  role: 'user' | 'admin'
}

interface Product {
  id: string
  nama_produk: string
  harga_satuan: number
  quantity: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = Cookies.get('user')
    if (!userData) {
      router.push('/signin')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('nama_produk')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    Cookies.remove('user')
    router.push('/signin')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('error delete', error)
    }
  }

  const handleSave = async (product: Omit<Product, 'id'> & { id?: string }) => {
    try {
      if (product.id) {
        const { error } = await supabase
          .from('products')
          .update({
            nama_produk: product.nama_produk,
            harga_satuan: product.harga_satuan,
            quantity: product.quantity
          })
          .eq('id', product.id)

        if (error) throw error
      } else {
       
        const { error } = await supabase
          .from('products')
          .insert([{
            nama_produk: product.nama_produk,
            harga_satuan: product.harga_satuan,
            quantity: product.quantity
          }])

        if (error) throw error
      }

      fetchProducts()
      setEditingProduct(null)
      setShowAddForm(false)
    } catch (error) {
      console.error('error,', error)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-800">
                {user.username} ({user.role})
              </span>
              <button
                onClick={handleSignOut}className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className={`p-6 rounded-lg mb-6 ${
            user.role === 'admin' ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <h2 className={`text-2xl font-bold ${ user.role === 'admin' ? 'text-red-800' : 'text-blue-800'}`}> Welcome, {user.username}!</h2>
            
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {user.role === 'admin' ? 'Product Management' : 'Product Catalog'}
              </h3>
              {user.role === 'admin' && (
                <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Product</button>)}
            </div>

           
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Satuan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    {user.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.nama_produk}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {product.harga_satuan.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.quantity}
                      </td>
                      {user.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                            
                            
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

     
      {(editingProduct || showAddForm) && (
        <ProductModal
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => {
            setEditingProduct(null)
            setShowAddForm(false)
          }}
        />
      )}
    </div>
  )
}


function ProductModal({
  product,
  onSave,
  onCancel
}: {
  product: Product | null
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    nama_produk: product?.nama_produk || '',
    harga_satuan: product?.harga_satuan || 0,
    quantity: product?.quantity || 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nama_produk || formData.harga_satuan <= 0 || formData.quantity < 0) {
      return
    }
    
    onSave({
      ...formData,
      ...(product?.id && { id: product.id })
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
              
            
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.nama_produk}
              onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Satuan
            </label>
            <input
              type="number"
              required
              min="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.harga_satuan}
              onChange={(e) => setFormData({ ...formData, harga_satuan: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              required
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              {product ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}