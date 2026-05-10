import { FilePlus, FolderPlus, Download } from 'lucide-react'

interface FileExplorerActionsProps {
	onCreateFile: () => void
	onCreateFolder: () => void
	onDownloadProject: () => void
}

export default function FileExplorerActions({
	onCreateFile,
	onCreateFolder,
	onDownloadProject,
}: FileExplorerActionsProps) {
	return (
		<div className="p-4 border-t border-gray-700 space-y-2">
			<button
				onClick={onCreateFile}
				className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
				title="新建文件"
			>
				<FilePlus className="w-4 h-4" />
				新建文件
			</button>
			<button
				onClick={onCreateFolder}
				className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
				title="新建文件夹"
			>
				<FolderPlus className="w-4 h-4" />
				新建文件夹
			</button>
			<button
				onClick={onDownloadProject}
				className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-700 text-white text-sm rounded hover:bg-green-600 transition-colors"
				title="下载项目"
			>
				<Download className="w-4 h-4" />
				下载项目
			</button>
		</div>
	)
}
