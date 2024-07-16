import { createContext, useEffect, useState } from "react";

export const typeError = [
  "valueMissing",
  "typeMismatch",
  "tooShort",
  "tooLong",
  "patternMismatch",
];

export const messages = {
  titulo: {
    valueMissing: "O campo título não pode estar vazio",
    tooShort: "O título deve ter pelo menos 3 caracteres",
  },
  categoria: {
    valueMissing: "O campo categoria não pode estar vazio",
  },
  imagen: {
    valueMissing: "O campo imagem não pode estar vazio",
    typeMismatch: "A imagem deve ser uma URL válida",
    patternMismatch:
      "A URL da imagem deve começar assim https://i.ytimg.com/vi/ e deve ser do YouTube",
  },
  video: {
    valueMissing: "O campo vídeo não pode estar vazio",
    typeMismatch: "O vídeo deve ser uma URL válida",
    patternMismatch:
      "A URL do vídeo deve ser do YouTube com a seguinte estrutura https://www.youtube.com/watch?v=",
  },
  descripcion: {
    valueMissing: "O campo descrição não pode estar vazio",
    tooShort: "A descrição deve ter pelo menos 3 caracteres",
    tooLong: "A descrição atingiu seu comprimento máximo",
  },
};

export const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [videoLink, setVideo] = useState("");
  const [description, setDescription] = useState("");

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [errorMessages, setErrorMessages] = useState({});

  // chamada Categorias da API
  useEffect(() => {
    fetch(
      "https://my-json-server.typicode.com/erikasisan/aluraflix-api/categorias"
    )
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // chamada Videos da API
  useEffect(() => {
    fetch(
      "https://my-json-server.typicode.com/erikasisan/aluraflix-api/videos"
    )
      .then((res) => res.json())
      .then((data) => setVideos(data));
  }, []);

  const deleteVideo = (id) => {
    fetch(
      `https://my-json-server.typicode.com/EdwardbotA/aluraflix-database/videos/${id}`,
      { method: "DELETE" }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao deletar o vídeo");
        }

        return res.json();
      })
      .then(() => {
        const newVideos = videos.filter((video) => video.id !== id);

        setVideos(newVideos);
        setPopup({
          show: true,
          message: "Vídeo deletado com sucesso",
          type: "success",
        });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
        }, 3000);
      })
      .catch((err) => {
        console.error("Error: ", err);
        setPopup({
          show: true,
          message: `Houve um problema ao deletar o vídeo: ${err}`,
          type: "error",
        });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
        }, 3000);
      });
  };

  const updateVideoInfo = (data) => {
    const { title, category, image, videoLink, description, id } = data;

    const updatedVideo = {
      titulo: title,
      Categoria: category,
      linkImagenVideo: image,
      linkVideo: videoLink,
      descripcion: description,
    };

    fetch(
      `https://my-json-server.typicode.com/EdwardbotA/aluraflix-database/videos/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(updatedVideo),
      }
    )
      .then((result) => result.json())
      .then((updatedVideoFromServer) => {
        const newInfo = videos.map((video) => {
          if (video.id === id) {
            return updatedVideoFromServer;
          }

          return video;
        });

        setVideos(newInfo);
        setPopup({
          show: true,
          message: "Vídeo atualizado com sucesso",
          type: "success",
        });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
        }, 3000);
      })
      .catch((err) => {
        console.error("Error: ", err);
        setPopup({
          show: true,
          message: `Houve um problema ao atualizar o vídeo: ${err}`,
          type: "error",
        });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
        }, 3000);
      });
  };

  const createNewVideo = (data) => {
    let newId = 1;

    while (videos.some((video) => newId === video.id)) {
      newId++;
    }

    const infoToSend = {
      Categoria: data.category,
      descripcion: data.description,
      linkVideo: data.videoLink,
      linkImagenVideo: data.image,
      titulo: data.title,
      id: newId,
    };

    fetch(
      `https://my-json-server.typicode.com/EdwardbotA/aluraflix-database/videos`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(infoToSend),
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao criar o vídeo");
        }

        return res.json();
      })
      .then((newVideo) => {
        setVideos([...videos, newVideo]);
        setPopup({
          show: true,
          message: `Vídeo adicionado com sucesso: ${newVideo.titulo}`,
          type: "success",
        });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
        }, 3000);
      })
      .catch((err) => {
        console.error("Error:", err);
        setPopup({
          show: true,
          message: `Houve um problema ao adicionar o vídeo: ${err}`,
          type: "error",
        });

        setTimeout(() => {
          setPopup({ show: false, message: "", type: "" });
        }, 3000);
      });
  };

  // verificação de inputs
  const clearInputs = () => {
    setTitle("");
    setCategory("");
    setImage("");
    setVideo("");
    setDescription("");
    setIsFormValid(false);
  };

  const verifyField = (field) => {
    let message = "";

    field.setCustomValidity("");

    typeError.forEach((error) => {
      if (field.validity[error]) {
        message = messages[field.name][error] || "Campo inválido";
      }
    });

    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      [field.name]: message,
    }));
  };

  const [formFields, setFormFields] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const allValid = Object.values(formFields).every(
      (field) => field.validity.valid
    );
    setIsFormValid(allValid);
  }, [formFields]);

  const handleInputChange = (name, value) => {
    switch (name) {
      case "titulo":
        setTitle(value);
        setFormFields({
          ...formFields,
          [name]: {
            ...formFields[name],
            value: value,
            validity: document.querySelector(`[name=${name}]`).validity,
          },
        });
        break;
      case "categoria":
        setCategory(value);
        setFormFields({
          ...formFields,
          [name]: {
            ...formFields[name],
            value: value,
            validity: document.querySelector(`[name=${name}]`).validity,
          },
        });
        break;
      case "imagen":
        setImage(value);
        setFormFields({
          ...formFields,
          [name]: {
            ...formFields[name],
            value: value,
            validity: document.querySelector(`[name=${name}]`).validity,
          },
        });
        break;
      case "video":
        setVideo(value);
        setFormFields({
          ...formFields,
          [name]: {
            ...formFields[name],
            value: value,
            validity: document.querySelector(`[name=${name}]`).validity,
          },
        });
        break;
      case "descripcion":
        setDescription(value);
        setFormFields({
          ...formFields,
          [name]: {
            ...formFields[name],
            value: value,
            validity: document.querySelector(`[name=${name}]`).validity,
          },
        });
        break;

      default:
        break;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        title,
        image,
        category,
        videoLink,
        description,
        videos,
        categories,
        selectedVideo,
        popup,
        errorMessages,
        isFormValid,
        handleInputChange,
        setSelectedVideo,
        setCategory,
        deleteVideo,
        updateVideoInfo,
        createNewVideo,
        clearInputs,
        verifyField,
        setErrorMessages,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
