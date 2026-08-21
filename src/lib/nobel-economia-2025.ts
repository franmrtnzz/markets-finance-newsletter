export const nobelArticleImages = {
  hero: '/images/articles/nobel-de-economia-2025/hero.png',
  figure1: '/images/articles/nobel-de-economia-2025/figure-1.png',
  figure2: '/images/articles/nobel-de-economia-2025/figure-2.jpg',
  figure3: '/images/articles/nobel-de-economia-2025/figure-3.jpg',
} as const

export const nobelArticle = {
  title: 'Joel Mokyr, Philippe Aghion y Peter Howitt',
  subtitle: 'Contribuciones que les valieron el Nobel 2025',
  sections: [
    {
      id: 'resumen',
      heading: 'Resumen',
      paragraphs: [
        'Este artículo sintetiza, desde una óptica histórica y teórica, el mensaje central que subyace a las contribuciones de Joel Mokyr, Philippe Aghion y Peter Howitt, galardonados con el Premio Nobel de Economía 2025. Mokyr explica por qué el crecimiento económico moderno emerge y se sostiene a partir de la sinergia entre conocimiento proposicional (ciencia) y conocimiento prescriptivo (tecnología aplicada), dentro de una cultura del crecimiento que protege la libertad de pensamiento y la experimentación. Aghion y Howitt modelizan el motor de ese crecimiento como un proceso de destrucción creativa donde innovaciones sucesivas sustituyen tecnologías previas, generando prosperidad neta bajo marcos institucionales que fomentan la competencia y difunden las innovaciones.',
      ],
    },
    {
      id: 'introduccion',
      heading: 'Introducción',
      paragraphs: [
        'La innovación y el progreso tecnológico han sido fenómenos presentes a lo largo de la historia de la humanidad. Sin embargo, lo que sí es reciente y una rara avis histórica es el crecimiento económico moderno sostenido que descansa en dichos avances.',
        'Como puede verse en la Figura 1, entre 1300 y 1680 el producto interior bruto per cápita se mantiene con una leve tendencia alcista pero esencialmente lateral. Por el contrario, en las Figuras 2 y 3 se aprecia que, a partir de 1800, el crecimiento se dispara formando el conocido «hockey stick», señalando una frontera histórica a comienzos del siglo XIX tras la cual la humanidad experimenta un crecimiento económico sin precedentes.',
        '«Lo que hay que explicar es la riqueza, pues la pobreza siempre fue condición estándar de la humanidad.» — Miguel Anxo Bastos.',
        'A través de sus contribuciones, Mokyr (historiador económico) trata de explicar los orígenes del crecimiento económico moderno y por qué surge en ese momento concreto. Por otro lado, Aghion y Howitt (teóricos de la economía) lo modelizan matemáticamente y establecen un marco teórico en el que el crecimiento económico moderno se hace posible. Todo gira alrededor de dos preguntas: ¿cómo el crecimiento económico moderno se convirtión en un fenómeno sostenido? y ¿qué nos mantiene en la senda de dicho crecimiento continuado?',
      ],
    },
    {
      id: 'crecimiento-economico-moderno',
      heading: 'La idea central: ¿qué es el crecimiento económico moderno?',
      paragraphs: [
        'Lo característico del crecimiento moderno es que es continuado y acumulativo: las economías avanzadas crecen año tras año de forma sistemática.',
        'Hoy damos por hecho ritmos medios de crecimiento del 1 %–2 % anual pero, si observamos el pasado, lo extraño históricamente y, por tanto, lo que hay que tratar de explicar, es la riqueza. Lo que hay que tratar de explicar es por qué algunos países se hicieron ricos y cómo esa riqueza se expande como mancha de aceite al resto del mundo.',
        'Mokyr sostiene que este crecimiento sostenido requiere progreso tecnológico continuado. No basta ampliar el stock de conocimiento proposicional (ideas, explicaciones, principios); es imprescindible su aplicación a técnicas productivas, es decir, un stock de conocimiento prescriptivo que crezca a un ritmo similar. La sinergia entre ambos es la fuente del progreso técnico sostenido.',
      ],
    },
    {
      id: 'joel-mokyr',
      heading: 'Joel Mokyr — Los orígenes históricos del crecimiento',
      paragraphs: [
        'Mokyr explica por qué esa sinergia ciencia + técnica cristaliza en un momento concreto y no antes. La frontera se sitúa en torno al inicio del siglo XIX, lo que se aprecia en las Figuras 2 y 3, coincidiendo con la Revolución Industrial en Inglaterra.',
        'Plantea, primero, una revolución científica o «revolución de la racionalidad» —atribuible a la Ilustración— que alimenta el stock de conocimiento proposicional y trata de explicar y modelizar el mundo desde una óptica científica. Segundo, capital humano técnico y trabajadores cualificados capaces de traducir este conocimiento proposicional en conocimiento prescriptivo: ingenieros y artesanos, pero también empresarios y comerciantes. Según teoriza Mokyr, una sociedad con buenos científicos, buenos ingenieros y buenos artesanos pero sin buenos empresarios, no gozará de progreso técnico sostenido.',
        'La tercera y última condición necesaria que impone es la libertad de pensamiento y lo que denomina como cultura del crecimiento. No solo importan los agentes, sino un entorno institucional que permita experimentar, intercambiar y aplicar conocimiento libremente incrementando de forma continuada ambos stocks (proposicional y prescriptivo), así como una moral establecida en la población que defienda la necesidad de que exista esta libertad de pensamiento.',
        'Esta condición aunque pueda interpretarse como lógica e indiscutible, es más controvertida de lo que parece: cada ola de progreso tecnológico genera ganadores y perdedores. Es un deber moral y cívico limitar la capacidad de que intereses creados bloqueen el avance vía sabotajes o lobbies antiprogreso. El ludismo durante la Revolución Industrial es un ejemplo. Sociedades donde dichos grupos capturan la agenda política tienden al estancamiento técnico, pues puede crecer su stock de conocimiento proposicional, pero no su stock de conocimiento prescriptivo.',
      ],
    },
    {
      id: 'aghion-howitt',
      heading: 'Philippe Aghion & Peter Howitt — El motor de la innovación',
      paragraphs: [
        'Aghion y Howitt, como teóricos de la economía, centran su aportación en modelizar cómo puede desarrollarse el crecimiento económico moderno. Su punto de partida, inspirado en el concepto de destrucción creativa sobre el que Schumpeter teorizaba en su obra Capitalismo, Socialismo y Democracia (1942), es clave: el progreso no se apila suavemente sobre lo existente, sino que opera mediante destrucción creativa.',
        'Muchas innovaciones sustituyen tecnologías previas en lugar de complementarlas. Aunque haya destrucción bruta de riqueza específica, el saldo neto es positivo cuando las nuevas técnicas desplazan a las antiguas por ser más productivas. Así, aun con volatilidad a nivel micro, el agregado muestra progreso sostenido.',
        'Un ejemplo ilustrativo: si el vehículo eléctrico sustituyera por completo al motor de combustión, la economía adyacente a este último se contraería; pero emergería una nueva economía alrededor del primero. Instituciones pro-competencia, difusión rápida de innovaciones y protección a la experimentación son condiciones para que el mecanismo schumpeteriano genere crecimiento sostenido.',
      ],
    },
    {
      id: 'conclusion',
      heading: '¿Qué nos quieren decir Mokyr, Aghion y Howitt?',
      paragraphs: [
        'La historia contada por Mokyr y la teoría económica modelizada por Aghion y Howitt convergen en una fórmula sencilla: ciencia + aplicación técnica y empresarial + cultura del crecimiento = prosperidad.',
        'Por un lado, Mokyr muestra cómo la Ilustración, las habilidades técnicas y la apertura institucional hicieron sostenible la primera gran ola de crecimiento. Por otro lado, Aghion y Howitt explican por qué mantener esa prosperidad exige destrucción creativa continua bajo un marco institucional y cultural que la promueva. Cuando los intereses creados frenan la difusión o las instituciones asfixian la experimentación, el motor del crecimiento se gripará.',
        'El mensaje central que nos transmiten estos tres científicos sociales es que es nuestro deber cuidar el crecimiento económico moderno, pues esta es la base de la prosperidad sostenida en el tiempo; y que cuidar el crecimiento económico moderno implica proteger la libertad científica, la libertad económica y la libre competencia. Si estos elementos mueren, también mueren la innovación y su aplicación a la mejora de procesos y, por tanto, el crecimiento económico moderno y la prosperidad que este nos proporciona.',
        'Para terminar este artículo, quiero citar a Matt Ridley en su obra How Innovation Works. Creo que, con ella, se puede resumir a grandes rasgos la aportación a la ciencia económica que les ha valido el Nobel a Joel Mokyr, Philippe Aghion y Peter Howitt:',
        '“La innovación es la madre de la prosperidad y la hija de la libertad.” — Matt Ridley.',
      ],
    },
  ],
} as const
