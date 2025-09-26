"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag
} from "lucide-react"
import { FormValidator, categoryValidationSchema } from "@/lib/form-validation"

interface CustomCategory {
  id: string
  name: string
  color: string
  transaction_type: 'expense' | 'income'
  is_default: boolean
  created_at: string
  updated_at: string
}

interface CategoryManagerProps {
  transactionType: 'expense' | 'income'
  onCategoryUpdate?: () => void
}

const colorOptions = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#10b981' },
  { name: 'Teal', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Emerald', value: '#059669' },
]

export function CategoryManager({ transactionType, onCategoryUpdate }: CategoryManagerProps) {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const [categories, setCategories] = useState<CustomCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#10b981',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validator = new FormValidator(categoryValidationSchema)

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user, transactionType]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = async () => {
    if (!user || !supabase) return

    try {
      setIsLoading(true)
      const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', transactionType)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validator.validate(formData)
    setErrors(validationErrors)
    
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    if (!user || !supabase) return

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .from('custom_categories')
          .update({
            name: formData.name,
            color: formData.color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id)
          .eq('user_id', user.id)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        // Create new category
        const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .from('custom_categories')
          .insert({
            user_id: user.id,
            name: formData.name,
            color: formData.color,
            transaction_type: transactionType,
            is_default: false,
          })

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }

      // Reset form and close dialog
      setFormData({ name: '', color: '#10b981' })
      setEditingCategory(null)
      setIsDialogOpen(false)
      setErrors({})
      
      // Refresh categories
      fetchCategories()
      onCategoryUpdate?.()
    } catch (error: unknown) {
      console.error('Error saving category:', error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save category",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: CustomCategory) => {
    if (category.is_default) {
      toast({
        title: "Cannot Edit",
        description: "Default categories cannot be edited",
        variant: "destructive",
      })
      return
    }

    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (category: CustomCategory) => {
    if (category.is_default) {
      toast({
        title: "Cannot Delete",
        description: "Default categories cannot be deleted",
        variant: "destructive",
      })
      return
    }

    if (!user || !supabase) return

    try {
      const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from('custom_categories')
        .delete()
        .eq('id', category.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })

      fetchCategories()
      onCategoryUpdate?.()
    } catch (error: unknown) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setFormData({ name: '', color: '#10b981' })
    setErrors({})
    setIsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {transactionType === 'expense' ? 'Expense' : 'Income'} Categories
        </CardTitle>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-sm truncate">{category.name}</span>
                </div>
                
                {!category.is_default && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {category.is_default && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the category name and color.' 
                : `Create a new ${transactionType} category.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: '' }))
                  }
                }}
                placeholder="Enter category name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Category Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-gray-900 dark:border-white scale-110' 
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#10b981"
                className="font-mono text-sm"
              />
              {errors.color && (
                <p className="text-sm text-red-500">{errors.color}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
