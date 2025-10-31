import Camera from './Camera.tsx';
import "./App.css";
import { Button } from "./components/ui/button.tsx";
import { Input } from "./components/ui/input.tsx";
import { base64logo } from "./logo.ts";
import { ImageAnalyzer } from './ImageAnalyzer.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';
import PhotoVault from './PhotoVault.tsx';
import OutfitComposer from "./OutfitComposer";

function submit(image: string) {
  console.log(image);
}

function captureImage(): string {
  return "base64..."
}

function App() {
  return (
    <>
      <h1>fitcheck</h1>
      <Input
        placeholder="API Key"
        className="flex items-center justify-center"
      />
      <div className="card">
        <div className="flex flex-col items-center justify-center">
          <img className="max-h-100 max-w-100" src={base64logo} />

          <WeatherWidget fallbackCity="Seoul" />
          <ImageAnalyzer />
          <Camera/>
          <Button onClick={() => captureImage}>
            Capture Image
          </Button>
          
          <Button
            type="submit"
            variant="outline"
            onClick={() => submit(base64logo)}
          >
            Submit
          </Button>
          <PhotoVault/>
          <OutfitComposer/>
        </div>
      </div>
    </>
  );
}

export default App;
