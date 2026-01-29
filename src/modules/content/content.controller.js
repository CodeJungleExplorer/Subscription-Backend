export const getContent = async (req, res) => {
  res.json({
    message: 'Welcome to protected content 🎬',
    userId: req.user.id,
    data: [
      { id: 1, title: 'Movie 1' },
      { id: 2, title: 'Movie 2' }
    ]
  });
};
