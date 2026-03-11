$routesFile = "C:\Users\PC\Desktop\tecrubelerim\src\routes\businessRoutes.js"
$content = Get-Content $routesFile -Raw -Encoding UTF8

$saveEndpoint = @'

  // --- POST/DELETE /:id/save -- Kaydet / Kaldir ---

  fastify.post('/:id/save', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    try {
      const business = await prisma.business.findUnique({ where: { id }, select: { id: true } });
      if (!business) return reply.code(404).send({ error: 'Isletme bulunamadi.' });

      const existing = await prisma.savedBusiness.findUnique({
        where: { userId_businessId: { userId: request.user.userId, businessId: id } },
      });
      if (existing) return reply.code(400).send({ error: 'Zaten kaydedilmis.' });

      await prisma.savedBusiness.create({
        data: { userId: request.user.userId, businessId: id },
      });
      return reply.code(201).send({ saved: true });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Kaydetme islemi basarisiz.' });
    }
  });

  fastify.delete('/:id/save', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.savedBusiness.deleteMany({
        where: { userId: request.user.userId, businessId: id },
      });
      return reply.code(200).send({ saved: false });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Kayit silme basarisiz.' });
    }
  });

'@

# export default'tan once ekle
$content = $content -replace '(export default)', "$saveEndpoint`$1"
[System.IO.File]::WriteAllText($routesFile, $content, [System.Text.Encoding]::UTF8)
Write-Host "businessRoutes.js guncellendi!"
