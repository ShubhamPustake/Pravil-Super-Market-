"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { deleteCategory, updateCategory } from "@/app/actions/categories"
import { createSubCategory, updateSubCategory, deleteSubCategory } from "@/app/actions/subcategories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type SubCategory = {
  id: string
  name: string
  categoryId: string
  _count: {
    products: number
  }
}

type Category = {
  id: string
  name: string
  description: string | null
  subCategories: SubCategory[]
  _count: {
    products: number
  }
}

export default function CategoryClient({ initialCategories }: { initialCategories: Category[] }) {
  const [search, setSearch] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Subcategory state
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null)
  const [subName, setSubName] = useState("")
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null)
  const [editSubName, setEditSubName] = useState("")
  
  const filteredCategories = initialCategories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    const next = new Set(expandedCategories)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedCategories(next)
  }

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete this category because it contains ${count} products. Reassign or delete the products first.`)
      return
    }
    
    if (confirm("Are you sure you want to delete this category?")) {
      setIsDeleting(id)
      try {
        await deleteCategory(id)
      } catch (error) {
        alert("Failed to delete category")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingCategory) return
    
    const formData = new FormData(e.currentTarget)
    try {
      await updateCategory(editingCategory.id, formData)
      setEditingCategory(null)
    } catch (error) {
      alert("Failed to update category")
    }
  }

  const handleAddSub = async (categoryId: string) => {
    if (!subName.trim()) return
    try {
      await createSubCategory(categoryId, subName.trim())
      setSubName("")
      setAddingSubTo(null)
    } catch (error) {
      alert("Failed to add subcategory. It may already exist.")
    }
  }

  const handleUpdateSub = async () => {
    if (!editingSub || !editSubName.trim()) return
    try {
      await updateSubCategory(editingSub.id, editSubName.trim())
      setEditingSub(null)
      setEditSubName("")
    } catch (error) {
      alert("Failed to update subcategory")
    }
  }

  const handleDeleteSub = async (sub: SubCategory) => {
    if (sub._count.products > 0) {
      alert(`Cannot delete "${sub.name}" because it has ${sub._count.products} products assigned. Reassign them first.`)
      return
    }
    if (confirm(`Delete subcategory "${sub.name}"?`)) {
      try {
        await deleteSubCategory(sub.id)
      } catch (error) {
        alert("Failed to delete subcategory")
      }
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 max-w-sm mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-8 bg-white dark:bg-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.id)
                return (
                  <React.Fragment key={category.id}>
                    <TableRow className="group">
                      <TableCell className="w-10 pr-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => toggleExpand(category.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-semibold">{category.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-400">
                          {category.subCategories.length} subcategories
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold">
                          {category._count.products} products
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => { setAddingSubTo(category.id); setExpandedCategories(prev => new Set(prev).add(category.id)) }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Sub
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(category.id, category._count.products)}
                          disabled={isDeleting === category.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded subcategory rows */}
                    {isExpanded && (
                      <>
                        {category.subCategories.map((sub: any) => (
                          <TableRow key={sub.id} className="bg-slate-50/50 dark:bg-slate-800/20">
                            <TableCell></TableCell>
                            <TableCell className="pl-8 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                {sub.name}
                              </span>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{sub._count.products} products</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => { setEditingSub(sub); setEditSubName(sub.name) }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteSub(sub)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Inline add subcategory row */}
                        {addingSubTo === category.id && (
                          <TableRow className="bg-green-50/50 dark:bg-green-900/10">
                            <TableCell></TableCell>
                            <TableCell colSpan={3} className="pl-8">
                              <div className="flex items-center gap-2">
                                <Input
                                  autoFocus
                                  placeholder="Subcategory name..."
                                  value={subName}
                                  onChange={(e) => setSubName(e.target.value)}
                                  className="h-8 max-w-xs text-sm"
                                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSub(category.id) } if (e.key === 'Escape') { setAddingSubTo(null); setSubName("") } }}
                                />
                                <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleAddSub(category.id)}>Add</Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => { setAddingSubTo(null); setSubName("") }}>Cancel</Button>
                              </div>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )}

                        {category.subCategories.length === 0 && addingSubTo !== category.id && (
                          <TableRow className="bg-slate-50/50 dark:bg-slate-800/20">
                            <TableCell></TableCell>
                            <TableCell colSpan={4} className="pl-8 text-sm text-muted-foreground italic">
                              No subcategories yet. Click "+ Sub" to add one.
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Category Name *</label>
                  <Input name="name" required defaultValue={editingCategory.name} />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input name="description" defaultValue={editingCategory.description || ""} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={!!editingSub} onOpenChange={(open) => !open && setEditingSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
          </DialogHeader>
          {editingSub && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Subcategory Name *</label>
                <Input 
                  value={editSubName} 
                  onChange={(e) => setEditSubName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateSub() }}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingSub(null)}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdateSub}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
