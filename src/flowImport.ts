import fs from 'fs'
import path from 'path'

function traverseDir(dir: string, allFlows: string[]) {
    fs.readdirSync(dir).forEach(file => {
      let fullPath = path.join(dir, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
         console.log(fullPath);
         traverseDir(fullPath, allFlows);
       } else {
         console.log(fullPath);
         if (fullPath.includes('.flow.ts')) {
              allFlows.push(fullPath)
         }
       }  
    });
  }

export async function flowImport(app: any, dir: string, flowFolder: string) {
    const dirPath = path.join(dir, flowFolder)
    const allFlows : string[] = []
    traverseDir(dirPath, allFlows)
    console.log(allFlows)
    for (let i = 0; i < allFlows.length; i++) {
         const flow = await import(allFlows[i])
         flow.default.makeRoute()
         app.use(flow.default.router)
    }
}