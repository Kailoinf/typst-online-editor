import { useState } from 'react'
import { PanelLeftClose } from 'lucide-react'
import type { Project } from '@/lib/storage/ProjectStorage'

interface FileExplorerHeaderProps {
	project: Project
	onToggleCollapse: () => void
	onRenameProject: (name: string) => void
}

export default function FileExplorerHeader({ project, onToggleCollapse, onRenameProject }: FileExplorerHeaderProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editName, setEditName] = useState(project.name)
	const visibleFileCount = project.files.filter(f => !f.path.endsWith('.gitkeep')).length

	function handleStartEdit() {
		setEditName(project.name)
		setIsEditing(true)
	}

	function handleConfirm() {
		const trimmed = editName.trim()
		if (trimmed && trimmed !== project.name) {
			onRenameProject(trimmed)
		}
		setIsEditing(false)
	}

	function handleCancel() {
		setIsEditing(false)
	}

	return (
		<div className="p-4 border-b border-gray-700 flex items-start justify-between">
			<div className="min-w-0 flex-1 mr-2">
				{isEditing ? (
					<input
						type="text"
						value={editName}
						onChange={e => setEditName(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') handleConfirm()
							if (e.key === 'Escape') handleCancel()
						}}
						onBlur={handleConfirm}
						className="w-full text-sm font-semibold bg-gray-800 text-gray-200 border border-blue-500 rounded px-1 py-0.5 outline-none"
						autoFocus
					/>
				) : (
					<h2
						className="text-sm font-semibold text-gray-200 cursor-pointer hover:text-blue-400 transition-colors truncate"
						onDoubleClick={handleStartEdit}
						title="双击编辑项目名称"
					>
						{project.name}
					</h2>
				)}
				<p className="text-xs text-gray-400 mt-1">{visibleFileCount} 个文件</p>
			</div>
			<button
				onClick={onToggleCollapse}
				className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-200 transition-colors shrink-0"
				title="关闭文件"
			>
				<PanelLeftClose className="w-4 h-4" />
			</button>
		</div>
	)
}
