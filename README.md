# Pixeldex

Trade CS:GO items trustlessly using smart contracts

![A screenshot of the UI](https://github.com/charcombination/pixeldex/blob/main/images/UI.png)

## Install

### API Keys

Pixeldex requires a [CSGO-Float API-Key](https://csgofloat.com/profile). To use it, change `env.example` to `.env` and replace the example key.

### Backend
```
cd pixeldex/backend
pip install -r requirements.txt
uvicorn main:app
```

### Frontend
```
cd pixeldex/frontend
npm install
npm start
```

### Contracts
Not yet integrated into the frontend, doesn't require any setup.

## Contributors

[@charcombination](https://twitter.com/charcombination)

## Version History

* 0.1
    * Initial Release

## License

This project is licensed under the MIT License - see the LICENSE.md file for details