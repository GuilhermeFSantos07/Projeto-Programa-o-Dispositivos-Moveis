import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as DB from "./banco";

// Botão customizado com efeito aurora
function AuroraButton({ title, onPress }) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ borderRadius: 12, overflow: "hidden", marginVertical: 8 }}
    >
      {pressed ? (
        <LinearGradient
          colors={["#00ff99", "#00e6e6", "#aaff00", "#00ffcc", "#00ff99"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.aurora}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.button}>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

function LoginScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const user = await DB.findUser(username, password);
      if (user) {
        onLogin(username);
      } else {
        Alert.alert("Erro", "Usuário ou senha inválidos.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Ocorreu um problema durante o login.");
    }
  };

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    try {
      await DB.addUser({ username, password });
      Alert.alert("Sucesso", "Usuário cadastrado! Faça login.");
      setIsLogin(true);
      setUsername("");
      setPassword("");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginTitle}>{isLogin ? "Login" : "Cadastro"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isLogin ? (
        <>
          <AuroraButton title="Entrar" onPress={handleLogin} />
          <Pressable onPress={() => setIsLogin(false)}>
            <Text style={styles.linkText}>Criar uma conta</Text>
          </Pressable>
        </>
      ) : (
        <>
          <AuroraButton title="Cadastrar" onPress={handleRegister} />
          <Pressable onPress={() => setIsLogin(true)}>
            <Text style={styles.linkText}>Já tem conta? Entrar</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const Tab = createBottomTabNavigator();

const produtosIniciais = [
  { id: "001", nome: "Teste", quantidade: 10, valor: 5.00 },
];

function RemoverEstoque({ refreshProducts }) {
  const [busca, setBusca] = useState("");
  const [quantRemover, setQuantRemover] = useState("");
  const [produto, setProduto] = useState(null);

  const handleBuscar = async () => {
    const encontrado = await DB.findProduct(busca);
    setProduto(encontrado || null);
  };

  const handleRemover = async () => {
    if (produto && quantRemover) {
      const numRemover = parseInt(quantRemover);
      if (numRemover > produto.quantidade) {
        Alert.alert("Erro", "Quantidade a remover é maior que a disponível");
        return;
      }
      const updatedProduct = {
        ...produto,
        quantidade: produto.quantidade - numRemover,
      };
      const success = await DB.updateProduct(updatedProduct);
      if (success) {
        Alert.alert("Sucesso", "Estoque atualizado!");
        refreshProducts();
        setProduto(null);
        setBusca("");
        setQuantRemover("");
      } else {
        Alert.alert("Erro", "Produto não encontrado.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar por ID ou nome"
        value={busca}
        onChangeText={setBusca}
      />
      <AuroraButton title="Buscar" onPress={handleBuscar} />
      {produto && (
        <View style={styles.produtoBox}>
          <Text>ID: {produto.id}</Text>
          <Text>Nome: {produto.nome}</Text>
          <Text>Quantidade: {produto.quantidade}</Text>
          <TextInput
            style={styles.input}
            placeholder="Quantidade a remover"
            value={quantRemover}
            onChangeText={setQuantRemover}
            keyboardType="numeric"
          />
          <AuroraButton title="Remover" onPress={handleRemover} />
        </View>
      )}
    </View>
  );
}

function CadastroProduto({ refreshProducts }) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valor, setValor] = useState("");

  const handleCadastrar = async () => {
    if (nome && quantidade && valor) {
      try {
        await DB.addProduct({ nome, quantidade, valor });
        Alert.alert("Sucesso", "Produto cadastrado!");
        setNome("");
        setQuantidade("");
        setValor("");
        refreshProducts();
      } catch (error) {
        Alert.alert("Erro", error.message);
      }
    } else {
      Alert.alert("Erro", "Preencha todos os campos.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Valor"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />
      <AuroraButton title="Cadastrar" onPress={handleCadastrar} />
    </View>
  );
}

function ListaProdutos({ produtos, refreshProducts }) {
  useEffect(() => {
    refreshProducts();
  }, []);

  const listaOrdenada = [...produtos].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  return (
    <FlatList
      style={styles.container}
      data={listaOrdenada}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.produtoBox}>
          <Text>ID: {item.id}</Text>
          <Text>Nome: {item.nome}</Text>
          <Text>Valor: R${item.valor.toFixed(2)}</Text>
          <Text>Quantidade: {item.quantidade}</Text>
        </View>
      )}
    />
  );
}

function App() {
  const [produtos, setProdutos] = useState([]);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      const data = await DB.getProducts();
      if (data.length === 0) {
        await DB.saveProducts(produtosIniciais);
        setProdutos(produtosIniciais);
      } else {
        setProdutos(data);
      }
    }
    loadProducts();
  }, []);

  const refreshProducts = async () => {
    const data = await DB.getProducts();
    setProdutos(data);
  };

  if (!usuarioLogado) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <LoginScreen onLogin={setUsuarioLogado} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === "Remover") iconName = "remove-circle-outline";
                else if (route.name === "Cadastro") iconName = "add-circle-outline";
                else if (route.name === "Lista") iconName = "list-circle-outline";
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#262626",
              tabBarInactiveTintColor: "#b3b3b3",
              tabBarStyle: {
                backgroundColor: "#fff",
                borderTopColor: "#ededed",
                height: 60,
                paddingBottom: 6,
              },
              tabBarLabelStyle: {
                fontSize: 13,
                fontWeight: "bold",
              },
              headerStyle: {
                backgroundColor: "#121212",
              },
              headerTitleStyle: {
                color: "#fff",
                fontWeight: "bold",
                fontSize: 22,
                letterSpacing: 1,
              },
              headerTitleAlign: "center",
            })}
          >
            <Tab.Screen name="Remover">
              {() => <RemoverEstoque refreshProducts={refreshProducts} />}
            </Tab.Screen>
            <Tab.Screen name="Cadastro">
              {() => <CadastroProduto refreshProducts={refreshProducts} />}
            </Tab.Screen>
            <Tab.Screen name="Lista">
              {() => (
                <ListaProdutos
                  produtos={produtos}
                  refreshProducts={refreshProducts}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    padding: 12,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  produtoBox: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ededed",
  },
  button: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  aurora: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fafafa",
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 24,
    textAlign: "center",
  },
  linkText: {
    color: "#27ae60",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
  },
});