import fs from 'fs'

class deleteFileService {
    public async deleteFile(fileName: any) {
        fs.unlink(fileName, (err: Error | null) => {
            if (err) console.error('err deleting file----', err);
            else return ("file deleted")
        })
    }
}

export default deleteFileService;