# ITI0105-2025



## EineMeister

Lehel on kuvatud toidupoe toodete hinnad. Samuti on olemas retsepti raamat, kus on võimalik ostukorv luua retsepti järgi. Retsepte saab valida näiteks kõige odavama või kõige suurema valgusisalduse/kaloraaži järgi.

Leht on mõeldud inimestele (eelkõige silmaspidades vaeseid tudengeid), kes tahavad tervislikumalt toituda, bulkida/cuttida, niisama raha kokku hoida või kui ei oska midagi küpsetada.

## Meie projekti prototüübi link
[Figma](https://www.figma.com/design/0ZWRGovzbGFlKLQ5LymYwL/Suured-mehed-O%C3%9C?t=svjSzxBcU1cOdCov-1)

## Hetkene projekti seis
- Sisse logimise leht
- Registreerimise leht
- Leht teavitamaks, et kasutaja on välja logitud
- "Unustasid parooli?" leht
- Regisreerimise lehel on võimalik kasutaja lisada [Firebase](#firebase-installeerimine) andmebaasi
- Enamusel lehtedel on esialgne CSS olemas
- Toodete lehel kuvatakse kõik tooted andmebaasis
- Navbar on olemas
- Esialgne adminvaade
- Retseptide lisamise leht peaaegu töötab 
- Toodete ja retseptide filter
- Konkreetse toote vaade
- Ostukorvi leht ja funktsionaalsus


## Tulemas
- Stiili parandused
- Kasutajatel võimalus lisada retsepte ja salvestada ostukorve
- Kasutajahaldus adminvaates
- 

## Kasutatud tehnoloogiad
- HTML5
- CSS
- JavaScript 1.5
- Firebase 14.20.0

## Projekti lokaalselt käivitamine
### 1. Projekti _clone_'imine
```bash
cd existing_repo
git clone https://gitlab.cs.taltech.ee/oslapi/iti0105-2025.git
```

### 2. Firebase installeerimine
Eelnevalt on vaja installeerida [Node.js](https://nodejs.org/en/download/current)
Peale seda terminalis:
```bash
npm install firebase
npm install -g firebase-tools

cd existing_repo

firebase init
```

### 3. Lokaalse serveri käivitamine
__Visual Studio Codel__ on __live-server__ extention vaja tõmmata. Peale seda saab paremalt alt käivita vajutades __Go Live__

__HTTP-server__ ei nõua ühegi kindlat IDEt (Node.js on nõutud). Installeerimine: 
```bash
npm install -g http-server
cd existing_repo
http-server
```
## Andmebaasi testimine enda ametega
Selleks tuleb logida enda Firebase kontoga sisse
```bash
firebase login
```
Firebases tuleb luua __authentication__  ja __firestore__ project ja sign in methodite alt valida __Email/Password__
Asendada firebase-config-global.js-is firebaseConfig enda omaga
## Autorid
- Osmo Lapin
- Henry Hanst
- Rait Tiitus
