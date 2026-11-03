import { listCategories } from "@/lib/category-data"

import { CategoryManager } from "./category-manager"

export default async function CategoriesPage() {
  const categories = await listCategories()
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 md:mx-0 md:max-w-none md:flex-none">
      <h1 className="text-xl font-bold">Categories</h1>
      <CategoryManager categories={categories} />
    </div>
  )
}
