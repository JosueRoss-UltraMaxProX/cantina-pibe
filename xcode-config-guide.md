# Guia de Configuração do Xcode

## Onde clicar:

1. **Navigator (lado esquerdo)**

   ```
   📁 CantinaDaPibe.xcodeproj
   └── 🔷 CantinaDaPibe (clique aqui - ícone azul)
       ├── 📁 CantinaDaPibe
       └── 📁 Pods
   ```

2. **Após clicar no projeto, no centro você verá:**

   - TARGETS: CantinaDaPibe
   - Clique em "CantinaDaPibe" em TARGETS

3. **Configurações importantes:**
   - General → Deployment Info → iOS 9.3
   - General → Deployment Info → Devices → iPad
   - Signing & Capabilities → Team → (selecione seu Apple ID)

## Se o Xcode estiver em português:

- General = Geral
- Deployment Info = Informações de Implantação
- Minimum Deployments = Implantações Mínimas
- Signing & Capabilities = Assinatura e Capacidades

## Alternativa via linha de comando:

Feche o Xcode e execute:

```bash
cd ios
pod install
open CantinaDaPibe.xcworkspace
```

O .xcworkspace (não .xcodeproj) é o arquivo correto após instalar CocoaPods.
