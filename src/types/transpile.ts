export interface TranspileOptions {
    sourceCode: string
    fileName: string
}

export interface TranspileResult {
    success: boolean
    rustCode?: string
    errors?: string[]
    warnings?: string[]
}

export interface CFunction {
    name: string
    returnType: string
    parameters: Array<{
        type: string
        name: string
    }>
    body: string
}

export interface CStruct {
    name: string
    fields: Array<{
        type: string
        name: string
    }>
}

