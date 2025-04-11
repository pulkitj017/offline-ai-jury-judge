import fs from 'fs';
import path from 'path';

export async function saveAnalysisOutput(data: any): Promise<string> {
    const outputDir = path.join(__dirname, '../outputs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const fileName = `analysis_${Date.now()}.json`;
    const filePath = path.join(outputDir, fileName);
    
    await fs.promises.writeFile(filePath, JSON.stringify(data));
    return filePath;
}
