import { Platform, Share } from "react-native";
export async function saveText(
  filename: string,
  text: string,
  type = "application/json",
) {
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    await Share.share({ title: filename, message: text });
  }
}
