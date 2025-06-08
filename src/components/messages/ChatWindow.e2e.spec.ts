import { test, expect } from '@playwright/test';

// Pruebas de usabilidad móvil para el chat

test.describe('ChatWindow - Usabilidad móvil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/direct-messages'); // Ruta correcta para Playwright
    await page.setViewportSize({ width: 375, height: 700 }); // Simula móvil
    // Seleccionar la primera conversación disponible
    const firstConv = page.locator('.divide-y > div, .divide-y > .p-4, .divide-y > .cursor-pointer').first();
    // Esperar a que la lista de conversaciones esté visible
    await firstConv.waitFor({ state: 'visible', timeout: 5000 });
    await firstConv.click();
  });

  test('El input de mensaje es visible y usable', async ({ page }) => {
    const input = page.locator('input[placeholder="Escribe un mensaje..."]');
    await expect(input).toBeVisible();
    await input.fill('Hola desde Playwright');
    await expect(input).toHaveValue('Hola desde Playwright');
  });

  test('Botón de enviar es tocable y envía mensaje', async ({ page }) => {
    const input = page.locator('input[placeholder="Escribe un mensaje..."]');
    await input.fill('Mensaje de prueba');
    const sendBtn = page.locator('button:has-text("Enviar")');
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();
    await expect(input).toHaveValue('');
  });

  test('Menú de adjuntos se despliega correctamente', async ({ page }) => {
    const optionsBtn = page.locator('button[aria-label="Más opciones"]');
    await optionsBtn.click();
    const mediaBtn = page.locator('button:has-text("Foto/Video")');
    await expect(mediaBtn).toBeVisible();
  });

  test('Selector de emojis es visible y funcional', async ({ page }) => {
    const emojiBtn = page.locator('button[aria-label="Emojis"]');
    await emojiBtn.click();
    const emojiPicker = page.locator('.emoji-picker, .absolute.z-50');
    await expect(emojiPicker).toBeVisible();
  });

  test('Botón de micrófono es tocable', async ({ page }) => {
    const micBtn = page.locator('button[aria-label="Grabar audio"]');
    await expect(micBtn).toBeVisible();
  });

  test('Se puede reaccionar a un mensaje', async ({ page }) => {
    // Enviar mensaje primero
    const input = page.locator('input[placeholder="Escribe un mensaje..."]');
    await input.fill('Mensaje para reacción');
    await page.locator('button:has-text("Enviar")').click();
    // Abrir menú contextual del mensaje (simular click)
    const msg = page.locator('.group').last();
    await msg.click();
    // Click en reacción 👍
    await page.locator('button[title="Reaccionar"]:has-text("👍")').click();
    // Verificar que la reacción aparece
    await expect(msg.locator('span')).toHaveText('👍');
  });

  test('Se puede responder a un mensaje', async ({ page }) => {
    // Enviar mensaje primero
    const input = page.locator('input[placeholder="Escribe un mensaje..."]');
    await input.fill('Mensaje para responder');
    await page.locator('button:has-text("Enviar")').click();
    // Abrir menú contextual del mensaje
    const msg = page.locator('.group').last();
    await msg.click();
    // Click en responder
    await page.locator('button[title="Responder"]').click();
    // Verificar que aparece el campo de respuesta
    await expect(page.locator('div:has-text("Respondiendo a")')).toBeVisible();
    // Enviar respuesta
    await input.fill('Esta es una respuesta');
    await page.locator('button:has-text("Enviar")').click();
    // Verificar que el nuevo mensaje muestra "Respondiendo a"
    const lastMsg = page.locator('.group').last();
    await expect(lastMsg).toContainText('Respondiendo a: Mensaje para responder');
  });

  test('Se puede eliminar un mensaje propio', async ({ page }) => {
    // Enviar mensaje primero
    const input = page.locator('input[placeholder="Escribe un mensaje..."]');
    await input.fill('Mensaje para eliminar');
    await page.locator('button:has-text("Enviar")').click();
    // Abrir menú contextual del mensaje
    const msg = page.locator('.group').last();
    await msg.click();
    // Click en eliminar
    await page.locator('button[title="Eliminar"]').click();
    // Verificar que el mensaje ya no está
    await expect(msg).not.toBeVisible();
  });
});
