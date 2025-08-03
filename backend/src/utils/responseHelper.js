class ResponseHelper {
    /**
     * Envía una respuesta exitosa
     * @param {Object} res - Objeto response de Express
     * @param {any} data - Datos a enviar
     * @param {string} message - Mensaje descriptivo
     * @param {number} status - Código de estado HTTP (default: 200)
     */
    static success(res, data = null, message = 'Operación exitosa', status = 200) {
        return res.status(status).json({
            success: true,
            status,
            message,
            data
        });
    }

    /**
     * Envía una respuesta de error
     * @param {Object} res - Objeto response de Express
     * @param {string} message - Mensaje de error
     * @param {number} status - Código de estado HTTP (default: 500)
     * @param {any} data - Datos adicionales (opcional)
     */
    static error(res, message = 'Error interno del servidor', status = 500, data = null) {
        return res.status(status).json({
            success: false,
            status,
            message,
            data
        });
    }

    /**
     * Envía una respuesta de error de validación
     * @param {Object} res - Objeto response de Express
     * @param {string} message - Mensaje de error de validación
     * @param {any} errors - Detalles de los errores de validación
     */
    static validationError(res, message = 'Error de validación', errors = null) {
        return res.status(400).json({
            success: false,
            status: 400,
            message,
            data: errors
        });
    }

    /**
     * Envía una respuesta de recurso no encontrado
     * @param {Object} res - Objeto response de Express
     * @param {string} message - Mensaje personalizado
     */
    static notFound(res, message = 'Recurso no encontrado') {
        return res.status(404).json({
            success: false,
            status: 404,
            message,
            data: null
        });
    }
}

module.exports = ResponseHelper;