import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in your .env file. Please add it to use AI features." },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const base64Data = Buffer.from(buffer).toString("base64")
    const mimeType = file.type

    // Use Gemini 3.5 Flash for multimodal tasks
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" })

    const prompt = `
      You are an expert accountant and data extraction AI. 
      Read the provided supplier invoice (which could be an image or PDF) and extract the line items.
      
      Respond STRICTLY with a valid JSON array of objects representing the purchased items.
      Do not include markdown blocks like \`\`\`json. Just output the raw JSON array.
      
      Each object must match exactly this structure:
      {
        "productName": "String (the exact name of the product)",
        "quantity": Number (quantity purchased),
        "purchasePrice": Number (price per unit, NOT the total price. Ensure it's a number),
        "sellingPrice": Number (extract the MRP or selling price if listed. If not found, output 0),
        "gst": Number (the GST percentage applied, usually 0, 5, 12, 18, or 28)
      }

      Example Output:
      [
        { "productName": "Amul Taaza Milk 500ml", "quantity": 10, "purchasePrice": 22.50, "sellingPrice": 25.00, "gst": 5 },
        { "productName": "Ashirvaad Atta 5kg", "quantity": 2, "purchasePrice": 210.00, "sellingPrice": 250.00, "gst": 0 }
      ]
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ])

    const responseText = result.response.text().trim()
    
    // Clean up potential markdown wrapper from Gemini response
    let jsonString = responseText
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "")
    }

    const extractedItems = JSON.parse(jsonString)

    return NextResponse.json({ items: extractedItems })
    
  } catch (error: any) {
    console.error("AI Invoice Extraction Error:", error)
    return NextResponse.json(
      { error: "Failed to parse invoice using AI. " + (error.message || "") },
      { status: 500 }
    )
  }
}
