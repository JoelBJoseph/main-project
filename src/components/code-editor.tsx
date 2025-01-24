import { useState, useEffect } from "react"
import { FolderTree, Loader2, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import FileDirectory from "../components/file-directory"
import { Analytics } from "./analytics"
import { geminiApi } from "../services/gemini-api.service"

interface SavedFile {
    name: string
    content: string
    type: "c" | "rust"
}

export default function CodeEditor({ isAuthenticated, handleLogout }: { isAuthenticated: boolean, handleLogout: () => void }) {
    const [cCode, setCCode] = useState<string>("")
    const [rustCode, setRustCode] = useState<string>("")
    const [fileName, setFileName] = useState<string>("")
    const [showRustTab, setShowRustTab] = useState<boolean>(false)
    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
    const [isTranspiled, setIsTranspiled] = useState<boolean>(false)
    const [isTranspiling, setIsTranspiling] = useState<boolean>(false)
    const [isCompiling, setIsCompiling] = useState<boolean>(false)
    const [showAnalytics, setShowAnalytics] = useState<boolean>(false)

    useEffect(() => {
        const storedFiles = localStorage.getItem("savedFiles")
        if (storedFiles) {
            try {
                setSavedFiles(JSON.parse(storedFiles))
            } catch (error) {
                console.error("Failed to parse saved files from localStorage", error)
            }
        }
    }, [])

    const handleFileSelect = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".c"
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                setFileName(file.name)
                const reader = new FileReader()
                reader.onload = (e) => {
                    const content = e.target?.result as string
                    setCCode(content)
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    const handleSave = () => {
        if (!fileName) {
            const name = prompt("Enter file name:")
            if (!name) return
            setFileName(name)
        }

        const fileNameWithExtension = fileName.endsWith(".c") ? fileName : `${fileName}.c`

        const newFile: SavedFile = {
            name: fileNameWithExtension,
            content: cCode,
            type: "c",
        }

        setSavedFiles((prev) => {
            const updatedFiles = [...prev.filter((f) => f.name !== fileNameWithExtension), newFile]
            localStorage.setItem("savedFiles", JSON.stringify(updatedFiles))
            return updatedFiles
        })

        const blob = new Blob([cCode], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = fileNameWithExtension
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleTranspile = async () => {
        if (!cCode.trim()) return
        setIsTranspiling(true)
        try {
            const result = await geminiApi.transpile({
                sourceCode: cCode,
                fileName: fileName || "untitled.c",
            })

            if (result.success && result.rustCode) {
                setRustCode(result.rustCode)
                setShowRustTab(true)
                setIsTranspiled(true)
                setShowAnalytics(true)

                const rustFileName = fileName.replace(".c", ".rs")
                setSavedFiles((prev) => {
                    const updatedFiles = [
                        ...prev.filter((file) => file.name !== rustFileName),
                        { name: rustFileName, content: result.rustCode, type: "rust" },
                    ]
                    localStorage.setItem("savedFiles", JSON.stringify(updatedFiles))
                    return updatedFiles
                })
            } else if (result.errors) {
                alert("Transpilation failed:\n" + result.errors.join("\n"))
            }
        } catch (error) {
            console.error("An error occurred during transpilation", error)
            alert("An error occurred during transpilation")
        } finally {
            setIsTranspiling(false)
        }
    }

    const handleDeleteFile = (fileName: string) => {
        const updatedFiles = savedFiles.filter((file) => file.name !== fileName)
        setSavedFiles(updatedFiles)
        localStorage.setItem("savedFiles", JSON.stringify(updatedFiles))

        if (fileName === fileName) {
            setFileName("")
            setCCode("")
            setRustCode("")
            setShowRustTab(false)
            setIsTranspiled(false)
            setShowAnalytics(false)
        }
    }

    const handleFileOpen = (selectedFileName: string) => {
        const selectedFile = savedFiles.find((file) => file.name === selectedFileName)
        if (selectedFile) {
            setFileName(selectedFile.name)
            if (selectedFile.type === "c") {
                setCCode(selectedFile.content)
                setShowRustTab(false)
                setIsTranspiled(false)
                setShowAnalytics(false)
            } else {
                setRustCode(selectedFile.content)
                setShowRustTab(true)
                setIsTranspiled(true)
                setShowAnalytics(true)
            }
        }
    }

    return (
        <div className="flex h-screen bg-neutral-900">
            <div className="w-64 border-r border-red-900 p-4 text-white">
                <div className="flex items-center gap-2 mb-4">
                    <FolderTree className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Directory</span>
                </div>
                <ul>
                    {savedFiles.map((file) => (
                        <li key={file.name} className="flex items-center justify-between mb-2">
                            <button
                                onClick={() => handleFileOpen(file.name)}
                                className="text-white hover:underline"
                            >
                                {file.name}
                            </button>
                            <Trash
                                className="h-4 w-4 text-red-500 cursor-pointer"
                                onClick={() => handleDeleteFile(file.name)}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-red-950 p-4 flex items-center justify-between">
                    <h1 className="text-white text-xl font-bold">SALVAGE</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                            onClick={handleFileSelect}
                        >
                            + Add File
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                            onClick={handleTranspile}
                            disabled={isTranspiling || !cCode.trim()}
                        >
                            {isTranspiling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Transpiling...
                                </>
                            ) : (
                                "Transpile"
                            )}
                        </Button>
                        {isAuthenticated && (
                            <Button
                                variant="outline"
                                className="bg-red-900 text-white hover:bg-red-800 border-red-700"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-4">
                    <Tabs defaultValue="c" className="h-full">
                        <TabsList className="bg-red-950">
                            <TabsTrigger value="c" className="text-white data-[state=active]:bg-red-900">
                                C Code
                            </TabsTrigger>
                            {showRustTab && (
                                <TabsTrigger value="rust" className="text-white data-[state=active]:bg-red-900">
                                    Rust Code
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="c" className="h-[calc(100%-40px)]">
                            <Textarea
                                value={cCode}
                                onChange={(e) => setCCode(e.target.value)}
                                placeholder="Enter your C code here..."
                                className="h-full bg-neutral-800 text-white border-red-900 focus-visible:ring-red-900"
                            />
                        </TabsContent>
                        <TabsContent value="rust" className="h-[calc(100%-40px)]">
                            <Textarea
                                value={rustCode}
                                onChange={(e) => setRustCode(e.target.value)}
                                placeholder="Transpiled Rust code will appear here..."
                                className="h-full bg-neutral-800 text-white border-red-900 focus-visible:ring-red-900"
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {showAnalytics && <Analytics cCode={cCode} rustCode={rustCode} />}
            </div>
        </div>
    )
}
