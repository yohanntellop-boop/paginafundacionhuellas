<?php
/*
 * Envío del formulario "Cuéntanos cómo quieres sumar" al correo de la Fundación.
 * Recibe POST desde index.html (#contactForm). Responde JSON si la petición lo pide
 * (envío con JavaScript) o redirige de vuelta a la página si el navegador no usa JS.
 */

const DESTINO   = 'info.fundacionhuellasdelcielo@gmail.com';
const REMITENTE = 'no-responder@fundacionhuellasdelcielo.com';
const NOMBRE_SITIO = 'Fundación Huellas del Cielo';

$quiereJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function responder($ok, $mensaje, $codigo = 200) {
    global $quiereJson;
    if ($quiereJson) {
        http_response_code($codigo);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: index.html?enviado=' . ($ok ? '1' : '0') . '#contacto', true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// Campo trampa: los humanos no lo ven; si viene lleno, es un robot. Se responde "ok" sin enviar.
if (!empty($_POST['sitio_web'])) {
    responder(true, 'Mensaje enviado.');
}

// Limpia texto de una sola línea (evita inyección de cabeceras de correo).
function linea($v, $max) {
    $v = trim((string)$v);
    $v = preg_replace('/[\r\n\t]+/', ' ', $v);
    return mb_substr($v, 0, $max, 'UTF-8');
}

$nombre  = linea($_POST['nombre']  ?? '', 90);
$correo  = linea($_POST['correo']  ?? '', 120);
$interes = linea($_POST['interes'] ?? '', 60);
$mensaje = trim((string)($_POST['mensaje'] ?? ''));
$mensaje = mb_substr(str_replace("\r\n", "\n", $mensaje), 0, 1200, 'UTF-8');
$acepta  = !empty($_POST['autorizacion']);

$intereses = ['Voluntariado', 'Alianza empresarial', 'Donación o apoyo en especie', 'Información general'];

if ($nombre === '' || $mensaje === '' || !$acepta) {
    responder(false, 'Por favor completa todos los campos y acepta la autorización.', 422);
}
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'El correo electrónico no es válido.', 422);
}
if (!in_array($interes, $intereses, true)) {
    responder(false, 'Selecciona cómo quieres participar.', 422);
}

$asunto = '=?UTF-8?B?' . base64_encode('Contacto web - ' . $interes) . '?=';
$nombreRemitente = '=?UTF-8?B?' . base64_encode(NOMBRE_SITIO . ' (sitio web)') . '?=';

$cuerpo  = "Nuevo mensaje desde el formulario del sitio web\n";
$cuerpo .= "------------------------------------------------\n\n";
$cuerpo .= "Nombre: {$nombre}\n";
$cuerpo .= "Correo: {$correo}\n";
$cuerpo .= "¿Cómo quiere participar?: {$interes}\n\n";
$cuerpo .= "Mensaje:\n{$mensaje}\n\n";
$cuerpo .= "------------------------------------------------\n";
$cuerpo .= "Enviado el " . date('d/m/Y H:i') . " desde fundacionhuellasdelcielo.com\n";
$cuerpo .= "Para responder, use \"Responder\": el correo irá a {$correo}.\n";

$cabeceras  = "From: {$nombreRemitente} <" . REMITENTE . ">\r\n";
$cabeceras .= "Reply-To: {$correo}\r\n";
$cabeceras .= "MIME-Version: 1.0\r\n";
$cabeceras .= "Content-Type: text/plain; charset=UTF-8\r\n";
$cabeceras .= "Content-Transfer-Encoding: 8bit\r\n";

$enviado = @mail(DESTINO, $asunto, $cuerpo, $cabeceras, '-f' . REMITENTE);

if ($enviado) {
    responder(true, '¡Gracias! Tu mensaje fue enviado a la Fundación. Te responderemos pronto.');
}
responder(false, 'No pudimos enviar tu mensaje en este momento. Inténtalo de nuevo más tarde.', 500);
