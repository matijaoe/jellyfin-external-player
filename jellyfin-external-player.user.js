// ==UserScript==
// @name         Jellyfin → Open in External Player
// @namespace    https://github.com/matijaoe/jellyfin-external-player
// @version      1.0.1
// @description  Adds a button to Jellyfin item detail pages that opens the stream in a native desktop player
// @author       matijao
// @license      MIT
// @homepageURL  https://github.com/matijaoe/jellyfin-external-player
// @supportURL   https://github.com/matijaoe/jellyfin-external-player/issues
// @downloadURL  https://raw.githubusercontent.com/matijaoe/jellyfin-external-player/master/jellyfin-external-player.user.js
// @updateURL    https://raw.githubusercontent.com/matijaoe/jellyfin-external-player/master/jellyfin-external-player.user.js
// @match        *://*/web/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	if (
		!document.querySelector('meta[name="application-name"][content="Jellyfin"]')
	)
		return

	// ─── Player registry ─────────────────────────────────────────────────
	const PLAYERS = {
		iina: {
			name: 'IINA',
			icon: 'launch',
			template: 'iina://weblink?url={URL}',
		},
	}

	const PLAYER = PLAYERS.iina

	// ─── Config ──────────────────────────────────────────────────────────
	const CONFIG = {
		buttonId: 'btnOpenInExternalPlayer',
		containerSelector: '.mainDetailButtons',
		anchorSelector: '.btnPlaystate',
		cloneSourceSelector: '.btnPlayTrailer',
		shortcut: {
			enabled: true,
			showInTooltip: true,
			code: 'KeyI', // physical key, immune to Option-layer substitution
			ctrl: true, // ⌃
			alt: true, // ⌥
			shift: false, // ⇧
			meta: true, // ⌘
		},
	}

	// ─── Shortcut formatting (Apple HIG order: ⌃ ⌥ ⇧ ⌘ Key) ──────────────
	const formatShortcut = (s) => {
		const parts = []
		if (s.ctrl) parts.push('⌃')
		if (s.alt) parts.push('⌥')
		if (s.shift) parts.push('⇧')
		if (s.meta) parts.push('⌘')
		parts.push(s.code.replace(/^Key/, '').replace(/^Digit/, ''))
		return parts.join('')
	}

	// ─── URL building ────────────────────────────────────────────────────
	const getItemId = () => {
		const m = location.hash.match(/[?&]id=([a-f0-9]{32})/i)
		return m ? m[1] : null
	}

	const buildStreamUrl = () => {
		const api = window.ApiClient
		if (!api) return null
		const id = getItemId()
		if (!id) return null
		return api.getUrl(`Items/${id}/Download`, { api_key: api.accessToken() })
	}

	const buildHandoffUrl = (streamUrl) =>
		PLAYER.template.replace('{URL}', encodeURIComponent(streamUrl))

	const openInPlayer = () => {
		const streamUrl = buildStreamUrl()
		if (!streamUrl) {
			console.warn(`[${PLAYER.name}] no item id / ApiClient`)
			return
		}
		location.href = buildHandoffUrl(streamUrl)
	}

	// ─── Button injection ────────────────────────────────────────────────
	const buttonTitle = () => {
		const base = `Open in ${PLAYER.name}`
		if (CONFIG.shortcut.enabled && CONFIG.shortcut.showInTooltip) {
			return `${base} (${formatShortcut(CONFIG.shortcut)})`
		}
		return base
	}

	const makeButton = (templateBtn) => {
		const btn = templateBtn.cloneNode(true)
		btn.id = CONFIG.buttonId
		btn.title = buttonTitle()
		btn.classList.remove('hide')

		// Strip Jellyfin's functional identifiers so delegated handlers don't fire
		;[...btn.classList].forEach((cls) => {
			if (cls.startsWith('btn')) btn.classList.remove(cls)
		})
		;[...btn.attributes].forEach((attr) => {
			if (attr.name.startsWith('data-')) btn.removeAttribute(attr.name)
		})

		const iconEl = btn.querySelector('.material-icons')
		if (iconEl)
			iconEl.className = `material-icons detailButton-icon ${PLAYER.icon}`

		btn.addEventListener('click', (e) => {
			e.preventDefault()
			e.stopPropagation()
			openInPlayer()
		})

		return btn
	}

	const inject = () => {
		document.querySelectorAll(CONFIG.containerSelector).forEach((row) => {
			if (row.querySelector('#' + CONFIG.buttonId)) return

			const playBtn = row.querySelector('.btnPlay')
			if (!playBtn || playBtn.classList.contains('hide')) return

			const template = row.querySelector(CONFIG.cloneSourceSelector)
			if (!template) return

			const anchor = row.querySelector(CONFIG.anchorSelector)
			const btn = makeButton(template)
			anchor ? row.insertBefore(btn, anchor) : row.appendChild(btn)
		})
	}

	// ─── Re-injection on SPA navigation ──────────────────────────────────
	let queued = false
	const schedule = () => {
		if (queued) return
		queued = true
		requestAnimationFrame(() => {
			queued = false
			inject()
		})
	}

	new MutationObserver(schedule).observe(document.body, {
		childList: true,
		subtree: true,
	})
	window.addEventListener('hashchange', () => setTimeout(inject, 100))
	inject()

	// ─── Keyboard shortcut ───────────────────────────────────────────────
	if (CONFIG.shortcut.enabled) {
		window.addEventListener('keydown', (e) => {
			const s = CONFIG.shortcut
			if (e.code !== s.code) return
			if (!!e.ctrlKey !== s.ctrl) return
			if (!!e.altKey !== s.alt) return
			if (!!e.shiftKey !== s.shift) return
			if (!!e.metaKey !== s.meta) return

			const tag = document.activeElement?.tagName
			if (
				tag === 'INPUT' ||
				tag === 'TEXTAREA' ||
				document.activeElement?.isContentEditable
			)
				return
			if (!document.querySelector('#' + CONFIG.buttonId)) return

			e.preventDefault()
			openInPlayer()
		})
	}
})()
