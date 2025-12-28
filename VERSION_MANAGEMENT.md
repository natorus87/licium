# Version Management für Licium

## Aktuelle Versionen

- **Frontend**: `client/package.json` → Version: `1.0.0`
- **Backend**: `server/package.json` → Version: `1.0.0`

## Versionierung updaten

### Manuell (Empfohlen für kleine Projekte)

1. **Frontend-Version ändern**:
   ```bash
   # Bearbeite client/package.json
   # Ändere "version": "1.0.0" zu "version": "1.1.0" (oder 2.0.0, etc.)
   ```

2. **Backend-Version ändern**:
   ```bash
   # Bearbeite server/package.json
   # Ändere "version": "1.0.0" zu "version": "1.1.0"
   ```

3. **Rebuild und Deploy**:
   ```bash
   # Frontend
   sg docker -c "docker build --no-cache -t natorus87/licium-client ./client"
   sg docker -c "docker push natorus87/licium-client:latest"
   kubectl rollout restart deployment frontend -n licium

   # Backend
   sg docker -c "docker build -t natorus87/licium-server ./server"
   sg docker -c "docker push natorus87/licium-server:latest"
   kubectl rollout restart deployment backend -n licium
   ```

### Mit npm (Automatisch)

```bash
# Im client/ oder server/ Verzeichnis:
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### Mit Git Tags (Fortgeschritten)

```bash
# Tag erstellen
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# In CI/CD könnte man dann die Version aus dem Tag extrahieren
```

## Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking Changes (API-Änderungen)
- **MINOR**: Neue Features (abwärtskompatibel)
- **PATCH**: Bugfixes

Beispiele:
- `1.0.0` → `1.0.1`: Kleiner Bugfix
- `1.0.0` → `1.1.0`: Neues Feature (Info Tab)
- `1.0.0` → `2.0.0`: Breaking Change (z.B. API-Redesign)

## Anzeige im UI

Die Versionen werden automatisch in `Einstellungen → Info` angezeigt:
- Frontend: Aus `client/package.json` importiert
- Backend: Vom `/api/system/info` Endpoint geladen
