import { useState, useEffect, useRef } from 'react'
import { projectStorage, type Project } from '@/lib/storage/ProjectStorage'

const TEMP_PROJECT: Project = {
	id: 'temp',
	name: '我的文档',
	files: [{ path: 'main.typ', content: '= 我的文档\n\n在此开始编写您的文档。', lastModified: 0 }],
	mainFile: 'main.typ',
	createdAt: 0,
	lastModified: 0,
}

export function useProjectState(onProjectChange?: (files: Record<string, string>, mainFile: string) => void) {
	// Always start with TEMP_PROJECT for SSR hydration compatibility
	const [currentProject, setCurrentProject] = useState<Project>(TEMP_PROJECT)
	const [activeFilePath, setActiveFilePath] = useState<string>(TEMP_PROJECT.mainFile)

	// Load from storage after hydration (client-side only)
	useEffect(() => {
		// Use setTimeout to avoid cascading renders during hydration
		const timer = setTimeout(() => {
			// Try to load most recent project from storage
			const projects = projectStorage.list()
			if (projects.length > 0) {
				const mostRecent = projects.sort((a, b) => b.lastModified - a.lastModified)[0]
				const project = projectStorage.load(mostRecent.id)
				if (project) {
					setCurrentProject(project)
					setActiveFilePath(project.mainFile)
					return
				}
			}
			
			// Create new project if none exist
			const newProject = projectStorage.createNew('我的文档')
			setCurrentProject(newProject)
			setActiveFilePath(newProject.mainFile)
		}, 0)

		return () => clearTimeout(timer)
	}, [])

	// Use ref to avoid re-triggering effect when callback identity changes
	const onProjectChangeRef = useRef(onProjectChange)
	onProjectChangeRef.current = onProjectChange

	// Notify parent when project content changes (not when callback changes)
	useEffect(() => {
		if (onProjectChangeRef.current) {
			const filesMap = currentProject.files.reduce<Record<string, string>>((acc, file) => {
				acc[file.path] = file.content
				return acc
			}, {})
			onProjectChangeRef.current(filesMap, currentProject.mainFile)
		}
	}, [currentProject])

	const loadProject = (project: Project) => {
		setCurrentProject(project)
		setActiveFilePath(project.mainFile)
		projectStorage.save(project)
	}

	const saveProject = (project: Project) => {
		setCurrentProject(project)
		projectStorage.save(project)
	}

	const renameProject = (name: string) => {
		setCurrentProject(prev => {
			const updated = { ...prev, name, lastModified: Date.now() }
			projectStorage.save(updated)
			return updated
		})
	}

	return {
		currentProject,
		activeFilePath,
		setActiveFilePath,
		loadProject,
		saveProject,
		renameProject,
	}
}
