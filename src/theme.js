export const colors = {
  background: '#FDFBF7', // cozy warm white/beige
  primary: '#FEC8D8', // cute pastel pink
  secondary: '#D291BC', // pastel purple
  accent: '#957DAD', // deep pastel purple
  success: '#E0BBE4', // light lavender
  warning: '#FFDFD3', // pastel orange/peach
  danger: '#ff9a9e', // soft red
  text: '#5B5B5B', // soft dark gray
  textLight: '#9A9A9A', // soft light gray
  white: '#FFFFFF',
  card: '#FFFFFF',
  shadow: '#D291BC',
};

export const fonts = {
  regular: 'System', // Can be customized with a custom font like 'Quicksand' or 'Nunito' later
  bold: 'System',
};

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
};
