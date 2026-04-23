import { useEffect } from 'react'
import { sileo } from 'sileo'
import { commandsService } from '@/services/commands'

export const GnomeExtensionCheck = () => {
  useEffect(() => {
    const checkStatus = async () => {
      const status = await commandsService.checkGnomeExtension()

      if (status.needs_extension && (!status.is_installed || !status.is_enabled)) {
        showOnboardingToast(status.message, status.is_installed)
      }
    }

    checkStatus()
  }, [])

  const showOnboardingToast = (message: string, isInstalled: boolean) => {
    sileo.action({
      title: 'GNOME Wayland detectado',
      description: message,
      duration: 10000,
      button: {
        title: isInstalled ? 'Activar ahora' : 'Instalar extensión',
        onClick: async () => {
          const result = await commandsService.setupGnomeExtension()

          if (result.success) {
            if (result.next_step === 'RESTART_SESSION') {
              sileo.success({
                title: 'Archivos instalados',
                description:
                  'Por favor, cierra sesión en GNOME y vuelve a entrar para cargar la extensión.',
              })
            } else if (result.next_step === 'DONE') {
              sileo.success({
                title: '¡Listo!',
                description: 'La extensión se ha activado correctamente.',
              })
            }
          } else {
            sileo.error({
              title: 'Error de configuración',
              description: result.message,
            })
          }
        },
      },
    })
  }

  return null
}
