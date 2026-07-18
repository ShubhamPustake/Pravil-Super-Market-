import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupplier } from "@/app/actions/suppliers"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewSupplierPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/suppliers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Supplier</h1>
          <p className="text-muted-foreground">
            Register a new wholesale supplier to the system.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm">
        <form action={createSupplier} className="p-6 grid gap-6">
          
          <div className="grid gap-2">
            <Label htmlFor="name">Supplier Name / Company Name *</Label>
            <Input id="name" name="name" required placeholder="e.g., ABC Distributors" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" name="contact" placeholder="Phone number" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gst">GST Number</Label>
            <Input id="gst" name="gst" placeholder="e.g., 27AAAAA0000A1Z5" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="Full address" />
          </div>

          <div className="mt-4 pt-4 border-t flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Save Supplier
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
