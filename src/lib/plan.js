import "server-only";
import { MODEL, WHO, SCENES, ATTIRE, ASPECTS, RESOLUTIONS } from "@/lib/app.config";
import { pick, urls, text } from "@/lib/plan-helpers";

export function plan(body) {
  const photos = urls(body.inputs, "photos", { min: 1, max: 4, name: "photo" });
  const who = WHO.find((w) => w.id === body.who) || WHO[0];
  const scene = SCENES.find((s) => s.id === body.scene) || SCENES[0];
  const attire = ATTIRE.find((a) => a.id === body.attire) || ATTIRE[0];
  const note = text(body.note, 300);
  const count = pick(Number(body.count), [1, 2, 4], 1);
  const many = photos.length > 1;
  const people = who.id === "couple"
    ? `the couple shown in the reference photo${many ? "s (if the photos show the partners separately, put both of them together in one shot)" : ""}`
    : `${who.prompt} shown in the reference photo${many ? "s" : ""}`;
  const outfit = attire.prompt
    ? (who.id === "couple" ? `Outfits: ${attire.prompt}.` : `Outfit in the style of ${attire.prompt}, only the one that fits ${who.prompt}.`)
    : "Keep the outfits from the photos.";
  const job = {
    model: MODEL,
    prompt:
      `A professional wedding photograph of ${people}, ${scene.prompt}. ${outfit} ` +
      "Natural romantic pose and genuine emotions, shot by a top wedding photographer, shallow depth of field, fine-art color grading. " +
      "Keep every person's exact face, identity, age, skin tone, body type and hair; realistic hands and fabric, photorealistic, no extra people." +
      (note ? ` Extra wishes: ${note}.` : ""),
    params: { aspect_ratio: pick(body.aspect, ASPECTS, "3:4"), resolution: pick(body.resolution, RESOLUTIONS, "1k") },
    inputs: { image_urls: photos },
  };
  return Array.from({ length: count }, () => job);
}
